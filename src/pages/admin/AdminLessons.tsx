import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/client";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Loader2,
  GripVertical,
  Play,
  Lock,
  Unlock,
  ArrowLeft,
  Video,
  Clock,
} from "lucide-react";

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  cloudinary_public_id: string | null;
  duration: number;
  order_index: number;
  is_free: boolean;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
  category: string;
}

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const emptyForm = {
  title: "",
  description: "",
  video_url: "",
  cloudinary_public_id: "",
  duration: 0,
  order_index: 1,
  is_free: false,
};

// Format seconds to hh:mm:ss
const formatDuration = (seconds: number): string => {
  if (!seconds) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
};

// Sortable Lesson Row Component
const SortableLessonRow = ({
  lesson,
  index,
  onEdit,
  onDelete,
  onToggleFree,
}: {
  lesson: Lesson;
  index: number;
  onEdit: (lesson: Lesson) => void;
  onDelete: (id: string) => void;
  onToggleFree: (lesson: Lesson) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 bg-white rounded-xl border transition-shadow ${isDragging
          ? "shadow-xl border-blue-300"
          : "border-gray-100 shadow-sm hover:shadow-md"
        }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing p-1 touch-none"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
        {index + 1}
      </div>

      <div className="w-16 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0">
        {lesson.video_url ? (
          <video
            src={lesson.video_url}
            className="w-full h-full object-cover"
            muted
          />
        ) : (
          <Video className="w-5 h-5 text-gray-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">
          {lesson.title}
        </p>
        {lesson.description && (
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {lesson.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-1">
          {lesson.duration > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              {formatDuration(lesson.duration)}
            </span>
          )}
          {lesson.video_url && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <Play className="w-3 h-3" />
              Video uploaded
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onToggleFree(lesson)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${lesson.is_free
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
      >
        {lesson.is_free ? (
          <>
            <Unlock className="w-3 h-3" /> Free Preview
          </>
        ) : (
          <>
            <Lock className="w-3 h-3" /> Paid
          </>
        )}
      </button>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onEdit(lesson)}
          className="p-1.5 text-gray-400 hover:text-[#0037FF] hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(lesson.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Main Component
const AdminLessons = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch data
  const fetchData = async () => {
    if (!courseId) return;
    setLoading(true);

    try {
      const [courseRes, lessonsRes] = await Promise.all([
        supabase
          .from("courses")
          .select("id, title, category")
          .eq("id", courseId)
          .single(),
        supabase
          .from("lessons")
          .select("*")
          .eq("course_id", courseId)
          .order("order_index", { ascending: true }),
      ]);

      if (courseRes.error) throw courseRes.error;
      if (courseRes.data) setCourse(courseRes.data);

      if (lessonsRes.error) throw lessonsRes.error;
      if (lessonsRes.data) setLessons(lessonsRes.data as Lesson[]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  // Open modal
  const openCreate = () => {
    setEditingLesson(null);
    setForm({
      ...emptyForm,
      order_index: lessons.length + 1,
    });
    setUploadProgress(0);
    setShowModal(true);
  };

  const openEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setForm({
      title: lesson.title,
      description: lesson.description || "",
      video_url: lesson.video_url || "",
      cloudinary_public_id: lesson.cloudinary_public_id || "",
      duration: lesson.duration || 0,
      order_index: lesson.order_index,
      is_free: lesson.is_free,
    });
    setUploadProgress(0);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLesson(null);
    setUploadProgress(0);
  };

  // Cloudinary Video Upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      alert(
        "Cloudinary is not configured. Please check your environment variables.\n\n" +
        "VITE_CLOUDINARY_CLOUD_NAME: " + (CLOUD_NAME || "missing") + "\n" +
        "VITE_CLOUDINARY_UPLOAD_PRESET: " + (UPLOAD_PRESET || "missing")
      );
      return;
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert("Please upload a valid video file (MP4, MOV, AVI, etc.)");
      return;
    }

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      alert("Video size must be less than 500MB");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", "bloom-skills/lessons");
      formData.append("resource_type", "video");

      // Use XMLHttpRequest for progress tracking
      const result = await new Promise<{ secure_url: string; public_id: string; duration: number }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            if (data.secure_url) {
              resolve({
                secure_url: data.secure_url,
                public_id: data.public_id,
                duration: Math.round(data.duration || 0),
              });
            } else {
              reject(new Error("Upload failed: No URL returned"));
            }
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error")));

        xhr.open(
          "POST",
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`
        );
        xhr.send(formData);
      });

      setForm((prev) => ({
        ...prev,
        video_url: result.secure_url,
        cloudinary_public_id: result.public_id,
        duration: result.duration,
      }));

      // Save to media_library
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("media_library").insert({
        name: file.name,
        url: result.secure_url,
        public_id: result.public_id,
        type: "video",
        size: file.size,
        format: file.type,
        uploaded_by: user?.id,
      });

    } catch (err: any) {
      console.error("Video upload error:", err);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Save Lesson
  const handleSave = async () => {
    if (!form.title.trim()) {
      alert("Lesson title is required.");
      return;
    }
    if (!courseId) return;

    setSaving(true);
    try {
      const payload = {
        course_id: courseId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        video_url: form.video_url || null,
        cloudinary_public_id: form.cloudinary_public_id || null,
        duration: Number(form.duration),
        order_index: Number(form.order_index),
        is_free: form.is_free,
      };

      if (editingLesson) {
        const { error } = await supabase
          .from("lessons")
          .update(payload)
          .eq("id", editingLesson.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("lessons").insert(payload);
        if (error) throw error;
      }

      await fetchData();
      closeModal();
    } catch (err: any) {
      console.error("Save lesson error:", err);
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete Lesson
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw error;
      setLessons((prev) => prev.filter((l) => l.id !== id));
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
    setDeleteConfirm(null);
  };

  // Toggle Free
  const handleToggleFree = async (lesson: Lesson) => {
    try {
      const { error } = await supabase
        .from("lessons")
        .update({ is_free: !lesson.is_free })
        .eq("id", lesson.id);

      if (!error) {
        setLessons((prev) =>
          prev.map((l) =>
            l.id === lesson.id ? { ...l, is_free: !l.is_free } : l
          )
        );
      }
    } catch (err) {
      console.error("Error toggling free status:", err);
    }
  };

  // Drag End (reorder)
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = lessons.findIndex((l) => l.id === active.id);
    const newIndex = lessons.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(lessons, oldIndex, newIndex);

    setLessons(reordered);

    setSavingOrder(true);
    try {
      const updates = reordered.map((lesson, index) =>
        supabase
          .from("lessons")
          .update({ order_index: index + 1 })
          .eq("id", lesson.id)
      );
      await Promise.all(updates);
    } catch (err) {
      console.error("Reorder save error:", err);
      await fetchData();
    } finally {
      setSavingOrder(false);
    }
  };

  const totalDuration = lessons.reduce((sum, l) => sum + (l.duration || 0), 0);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => navigate("/admin/courses")}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <span
                className="hover:text-[#0037FF] cursor-pointer"
                onClick={() => navigate("/admin/courses")}
              >
                Courses
              </span>
              <span>/</span>
              <span className="text-gray-600">{course?.title}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manage Lessons
            </h1>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Lesson
          </button>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 mb-8 px-2">
          <span className="text-sm text-gray-500">
            <strong className="text-gray-900">{lessons.length}</strong> lessons
          </span>
          <span className="text-sm text-gray-500">
            <strong className="text-gray-900">
              {formatDuration(totalDuration)}
            </strong>{" "}
            total duration
          </span>
          <span className="text-sm text-gray-500">
            <strong className="text-gray-900">
              {lessons.filter((l) => l.is_free).length}
            </strong>{" "}
            free previews
          </span>
          {savingOrder && (
            <span className="flex items-center gap-1 text-xs text-blue-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving order...
            </span>
          )}
        </div>

        {/* Drag and Drop List */}
        {lessons.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
            <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No lessons yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Add your first lesson to this course
            </p>
            <button
              onClick={openCreate}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Add First Lesson
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={lessons.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {lessons.map((lesson, index) => (
                  <SortableLessonRow
                    key={lesson.id}
                    lesson={lesson}
                    index={index}
                    onEdit={openEdit}
                    onDelete={(id) => setDeleteConfirm(id)}
                    onToggleFree={handleToggleFree}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {lessons.length > 0 && (
          <p className="text-xs text-gray-400 text-center mt-4">
            Drag lessons to reorder them
          </p>
        )}
      </main>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingLesson ? "Edit Lesson" : "Add New Lesson"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. Introduction to React Hooks"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={2}
                  placeholder="Brief description of what this lesson covers"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lecture Video
                </label>

                {form.video_url ? (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                      <video
                        src={form.video_url}
                        controls
                        className="w-full h-full"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Play className="w-4 h-4" />
                        <span>Video uploaded</span>
                        {form.duration > 0 && (
                          <span className="text-gray-400">
                            · {formatDuration(form.duration)}
                          </span>
                        )}
                      </div>
                      <label className="cursor-pointer text-sm text-[#0037FF] hover:underline">
                        Replace video
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={handleVideoUpload}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    {uploading ? (
                      <div className="text-center px-6 w-full">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-[#0037FF] font-medium">
                          Uploading... {uploadProgress}%
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          Click to upload lecture video
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          MP4, MOV, AVI — max 500MB
                        </p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoUpload}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>

              {/* Or paste URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Or paste video URL
                </label>
                <input
                  type="url"
                  value={form.video_url}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, video_url: e.target.value }))
                  }
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Duration + Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.duration}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        duration: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {form.duration > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      = {formatDuration(form.duration)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Index
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.order_index}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        order_index: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Free Preview Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Free Preview
                  </p>
                  <p className="text-xs text-gray-400">
                    Non-enrolled students can watch this lesson
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setForm((p) => ({ ...p, is_free: !p.is_free }))
                  }
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.is_free ? "bg-green-500" : "bg-gray-300"
                    }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_free ? "translate-x-5" : "translate-x-0"
                      }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingLesson ? "Save Changes" : "Add Lesson"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-center mb-2">
              Delete Lesson?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              This will permanently delete this lesson and its progress data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLessons;