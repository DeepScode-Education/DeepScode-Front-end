import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/integrations/client";
import { uploadImage } from "@/lib/storage";
import { toast } from "sonner";
import { Loader2, ImageIcon, X, Upload } from "lucide-react";

interface CourseRow {
  id: string;
  slug?: string | null;
  title: string;
  description: string | null;
  category: string | null;
  duration: string | null;
  level: string | null;
  total_modules: number;
  image_url: string | null;
  thumbnail_url: string | null;
  price: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface CourseForm {
  id?: string;
  slug?: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  level: string;
  total_modules: number;
  image_url: string;
  thumbnail_url: string;
  price: number;
  is_published: boolean;
}

const defaultCourseForm: CourseForm = {
  title: "",
  slug: "",
  description: "",
  category: "",
  duration: "",
  level: "",
  total_modules: 1,
  image_url: "",
  thumbnail_url: "",
  price: 0,
  is_published: true,
};

const generateSlug = (input: string) =>
  input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const categoryOptions = ["Design", "Coding", "Marketing", "Data"];
const levelOptions = ["Beginner", "Intermediate", "Advanced"];
const durationOptions = ["4 weeks", "6 weeks", "8 weeks", "10 weeks", "12 weeks", "16 weeks"];

const normalizeCategory = (category: string | null | undefined) => {
  if (!category) return "3D";
  return category === "Coding" ? "3D" : category;
};

const AdminCourses = () => {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CourseForm>(defaultCourseForm);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load courses", error);
        toast.error("Could not fetch courses");
        setCourses([]);
      } else {
        setCourses((data as CourseRow[]) ?? []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error loading courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const resetForm = () => {
    setForm(defaultCourseForm);
    setIsEditing(false);
    setImagePreview(null);
  };

  const handleSelectCourse = (course: CourseRow) => {
    setForm({
      id: course.id,
      slug: course.slug ?? "",
      title: course.title,
      description: course.description ?? "",
      category: normalizeCategory(course.category),
      duration: course.duration ?? "",
      level: course.level ?? "",
      total_modules: course.total_modules ?? 1,
      image_url: course.image_url ?? "",
      thumbnail_url: course.thumbnail_url ?? "",
      price: course.price ?? 0,
      is_published: course.is_published ?? false,
    });
    setImagePreview(course.image_url);
    setIsEditing(true);
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadImage(file, "courses", "course-images");
      setForm((prev) => ({
        ...prev,
        image_url: result.publicUrl,
        thumbnail_url: result.publicUrl,
      }));
      setImagePreview(result.publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Course image upload failed:", error);
      toast.error(
        error?.message || error?.details || JSON.stringify(error) || "Image upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setForm((prev) => ({
      ...prev,
      image_url: "",
      thumbnail_url: "",
    }));
    setImagePreview(null);
    toast.info("Image removed");
  };

  const saveCourse = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!form.category.trim()) {
      toast.error("Category is required");
      return;
    }

    const payload = {
      title: form.title.trim(),
      slug: (form.slug && form.slug.trim()) ? generateSlug(form.slug) : generateSlug(form.title),
      description: form.description.trim() || null,
      category: form.category.trim(),
      duration: form.duration.trim() || null,
      level: form.level.trim() || null,
      total_modules: Number(form.total_modules) || 1,
      image_url: form.image_url || null,
      thumbnail_url: form.thumbnail_url || null,
      price: Number(form.price) || 0,
      is_published: form.is_published,
    };

    setSaving(true);

    try {
      if (isEditing && form.id) {
        const { error } = await supabase
          .from("courses")
          .update(payload)
          .eq("id", form.id);

        if (error) throw error;

        toast.success("Course updated successfully");
      } else {
        const { error } = await supabase.from("courses").insert([payload]);

        if (error) throw error;

        toast.success("Course created successfully");
      }

      resetForm();
      await fetchCourses();
    } catch (err: any) {
      console.error("Could not save course", err);
      toast.error(`Failed to save course: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteCourse = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    setDeletingId(id);
    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);

      if (error) throw error;

      toast.success("Course deleted successfully");
      if (form.id === id) resetForm();
      await fetchCourses();
    } catch (err: any) {
      console.error("Could not delete course", err);
      toast.error(`Failed to delete course: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const courseCount = useMemo(() => courses.length, [courses]);

  // Convert USD to INR
  const usdToInr = (usd: number) => {
    return Math.round(usd * 85);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Admin Courses</h1>
          <p className="text-sm text-muted-foreground">
            Manage course library: create, edit, delete, and upload images.
          </p>
          <div className="text-sm">
            Total courses: <span className="font-semibold">{courseCount}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
          {/* Course List Section */}
          <section className="xl:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Catalog</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : courses.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No courses found. Add your first course.
                  </p>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="px-2 py-2">Image</th>
                        <th className="px-2 py-2">Title</th>
                        <th className="px-2 py-2">Category</th>
                        <th className="px-2 py-2">Price</th>
                        <th className="px-2 py-2">Published</th>
                        <th className="px-2 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course) => (
                        <tr key={course.id} className="odd:bg-white even:bg-slate-50">
                          <td className="px-2 py-2">
                            {course.image_url ? (
                              <img
                                src={course.image_url}
                                alt={course.title}
                                className="h-10 w-10 rounded object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="px-2 py-2 font-medium">{course.title}</td>
                          <td className="px-2 py-2">{course.category}</td>
                          <td className="px-2 py-2">₹{usdToInr(course.price ?? 0).toLocaleString('en-IN')}</td>
                          <td className="px-2 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${course.is_published
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                              }`}>
                              {course.is_published ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="px-2 py-2 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSelectCourse(course)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteCourse(course.id)}
                              disabled={deletingId === course.id}
                            >
                              {deletingId === course.id ? "..." : "Delete"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Course Form Section */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>{isEditing ? "Edit Course" : "New Course"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={saveCourse} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                      placeholder="e.g., Full Stack Web (3D)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={form.slug ?? ""}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder="optional (auto-generated from title)"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Leave empty to auto-generate from title.</p>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3}
                      placeholder="Course description..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={form.category}
                        onValueChange={(value) => setForm({ ...form, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="level">Level</Label>
                      <Select
                        value={form.level}
                        onValueChange={(value) => setForm({ ...form, level: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {levelOptions.map((lvl) => (
                            <SelectItem key={lvl} value={lvl}>
                              {lvl}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Select
                        value={form.duration}
                        onValueChange={(value) => setForm({ ...form, duration: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {durationOptions.map((dur) => (
                            <SelectItem key={dur} value={dur}>
                              {dur}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="total_modules">Total Modules</Label>
                      <Input
                        id="total_modules"
                        type="number"
                        min={1}
                        value={form.total_modules}
                        onChange={(e) =>
                          setForm({ ...form, total_modules: Number(e.target.value) || 1 })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="price">Price (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min={0}
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      placeholder="0.00"
                    />
                    {form.price > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ≈ ₹{usdToInr(form.price).toLocaleString('en-IN')} INR
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Course Image</Label>
                    <div className="mt-1 flex items-center gap-4">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Course preview"
                            className="h-20 w-20 rounded-lg object-cover border"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center border">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <label className="cursor-pointer">
                          <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 w-fit">
                            <Upload className="h-4 w-4" />
                            <span className="text-sm">Upload Image</span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={uploading}
                            className="hidden"
                          />
                        </label>
                        {uploading && (
                          <div className="flex items-center gap-2 mt-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-xs text-muted-foreground">Uploading...</span>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG, WebP. Max 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="published"
                      checked={form.is_published}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({ ...prev, is_published: Boolean(checked) }))
                      }
                    />
                    <Label htmlFor="published" className="cursor-pointer">
                      Published (visible to students)
                    </Label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="submit" disabled={saving || uploading} className="flex-1">
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : isEditing ? (
                        "Update Course"
                      ) : (
                        "Create Course"
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminCourses;