import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/client";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
    Upload,
    Trash2,
    Copy,
    Check,
    Search,
    Image,
    Video,
    FileText,
    Loader2,
    X,
    Filter,
    ExternalLink,
} from "lucide-react";

interface MediaFile {
    id: string;
    name: string | null;
    url: string;
    public_id: string | null;
    type: string | null;
    size: number | null;
    format: string | null;
    created_at: string;
}

type FilterType = "all" | "image" | "video" | "document";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const formatSize = (bytes: number | null): string => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const getFileType = (mimeType: string | null): FilterType => {
    if (!mimeType) return "document";
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    return "document";
};

const typeIcon = (type: string | null) => {
    switch (getFileType(type)) {
        case "image": return <Image className="w-4 h-4 text-blue-500" />;
        case "video": return <Video className="w-4 h-4 text-purple-500" />;
        default: return <FileText className="w-4 h-4 text-orange-500" />;
    }
};

const typeBadge = (type: string | null) => {
    switch (getFileType(type)) {
        case "image":
            return "bg-blue-50 text-[#0037FF]";
        case "video":
            return "bg-purple-50 text-purple-600";
        default:
            return "bg-orange-50 text-orange-600";
    }
};

// ── Drag and Drop Upload Zone ─────────────────────────────────
const DropZone = ({
    onFiles,
    uploading,
    uploadProgress,
    uploadingName,
}: {
    onFiles: (files: FileList) => void;
    uploading: boolean;
    uploadProgress: number;
    uploadingName: string;
}) => {
    const [dragging, setDragging] = useState(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length > 0) {
            onFiles(e.dataTransfer.files);
        }
    };

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl transition-all ${dragging
                    ? "border-blue-400 bg-blue-50 scale-[1.01]"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
                }`}
        >
            <div className="p-10 text-center">
                {uploading ? (
                    <div className="space-y-3">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
                        <p className="text-sm font-medium text-gray-700">
                            Uploading {uploadingName}...
                        </p>
                        <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400">{uploadProgress}%</p>
                    </div>
                ) : (
                    <>
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Upload className="w-7 h-7 text-blue-500" />
                        </div>
                        <p className="text-gray-700 font-medium mb-1">
                            Drag & drop files here
                        </p>
                        <p className="text-gray-400 text-sm mb-4">
                            Images, videos, PDFs and documents
                        </p>
                        <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                            <Upload className="w-4 h-4" />
                            Browse Files
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                                onChange={(e) => {
                                    if (e.target.files) onFiles(e.target.files);
                                }}
                            />
                        </label>
                    </>
                )}
            </div>
        </div>
    );
};

// ── Media Card ────────────────────────────────────────────────
const MediaCard = ({
    file,
    onDelete,
    onCopy,
    copied,
}: {
    file: MediaFile;
    onDelete: (file: MediaFile) => void;
    onCopy: (url: string) => void;
    copied: string | null;
}) => {
    const fileType = getFileType(file.format);

    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-md transition-all">
            {/* Preview */}
            <div className="relative h-40 bg-gray-50 overflow-hidden">
                {fileType === "image" ? (
                    <img
                        src={file.url}
                        alt={file.name || "media"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : fileType === "video" ? (
                    <div className="relative w-full h-full">
                        <video
                            src={file.url}
                            className="w-full h-full object-cover"
                            muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                                <Video className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <FileText className="w-12 h-12 text-orange-400" />
                        <p className="text-xs text-gray-400 mt-2 uppercase">
                            {file.format?.split("/")[1] || "file"}
                        </p>
                    </div>
                )}

                {/* Hover Actions Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                        onClick={() => onCopy(file.url)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
                        title="Copy URL"
                    >
                        {copied === file.url ? (
                            <>
                                <Check className="w-3 h-3 text-green-500" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="w-3 h-3" />
                                Copy URL
                            </>
                        )}
                    </button>
                    <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
                    >
                        <ExternalLink className="w-3 h-3" />
                        Open
                    </a>
                </div>
            </div>

            {/* Info */}
            <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">
                            {file.name || "Unnamed file"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <span
                                className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md font-medium ${typeBadge(file.format)}`}
                            >
                                {typeIcon(file.format)}
                                {fileType}
                            </span>
                            <span className="text-xs text-gray-400">
                                {formatSize(file.size)}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            {formatDate(file.created_at)}
                        </p>
                    </div>
                    <button
                        onClick={() => onDelete(file)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────
const AdminMedia = () => {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadingName, setUploadingName] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterType>("all");
    const [copied, setCopied] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<MediaFile | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // ── Fetch Media ──────────────────────────────────────────────
    const fetchMedia = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("media_library")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) console.error("Fetch media error:", error);
        else setFiles(data || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    // ── Upload Files ─────────────────────────────────────────────
    const uploadFiles = async (fileList: FileList) => {
        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            alert("Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file.");
            return;
        }

        const filesToUpload = Array.from(fileList);

        for (const file of filesToUpload) {
            setUploading(true);
            setUploadProgress(0);
            setUploadingName(file.name);

            try {
                const isVideo = file.type.startsWith("video/");
                const isImage = file.type.startsWith("image/");
                const resourceType = isVideo ? "video" : isImage ? "image" : "raw";

                const formData = new FormData();
                formData.append("file", file);
                formData.append("upload_preset", UPLOAD_PRESET);
                formData.append("folder", `bloom-skills/${resourceType}s`);

                const url = `[api.cloudinary.com](https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload)`;

                const uploadedUrl = await new Promise<{
                    secure_url: string;
                    public_id: string;
                }>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();

                    xhr.upload.addEventListener("progress", (event) => {
                        if (event.lengthComputable) {
                            setUploadProgress(
                                Math.round((event.loaded / event.total) * 100)
                            );
                        }
                    });

                    xhr.addEventListener("load", () => {
                        if (xhr.status === 200) {
                            resolve(JSON.parse(xhr.responseText));
                        } else {
                            reject(new Error("Upload failed"));
                        }
                    });

                    xhr.addEventListener("error", () =>
                        reject(new Error("Network error"))
                    );
                    xhr.open("POST", url);
                    xhr.send(formData);
                });

                // Save to Supabase media_library
                const { data: { user } } = await supabase.auth.getUser();
                const { data: inserted } = await supabase
                    .from("media_library")
                    .insert({
                        name: file.name,
                        url: uploadedUrl.secure_url,
                        public_id: uploadedUrl.public_id,
                        type: resourceType,
                        size: file.size,
                        format: file.type,
                        uploaded_by: user?.id,
                    })
                    .select()
                    .single();

                if (inserted) {
                    setFiles((prev) => [inserted, ...prev]);
                }
            } catch (err: any) {
                console.error(`Upload failed for ${file.name}:`, err);
                alert(`Failed to upload ${file.name}: ${err.message}`);
            } finally {
                setUploading(false);
                setUploadProgress(0);
                setUploadingName("");
            }
        }
    };

    // ── Copy URL ─────────────────────────────────────────────────
    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopied(url);
        setTimeout(() => setCopied(null), 2000);
    };

    // ── Delete ───────────────────────────────────────────────────
    const handleDelete = async (file: MediaFile) => {
        try {
            await supabase.from("media_library").delete().eq("id", file.id);
            setFiles((prev) => prev.filter((f) => f.id !== file.id));
        } catch (err) {
            console.error("Delete error:", err);
        }
        setDeleteConfirm(null);
    };

    // ── Filter + Search ──────────────────────────────────────────
    const filtered = files.filter((file) => {
        const matchesSearch = (file.name || "")
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesType =
            filter === "all" || getFileType(file.format) === filter;
        return matchesSearch && matchesType;
    });

    const counts = {
        all: files.length,
        image: files.filter((f) => getFileType(f.format) === "image").length,
        video: files.filter((f) => getFileType(f.format) === "video").length,
        document: files.filter((f) => getFileType(f.format) === "document").length,
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminSidebar />

            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {files.length} files uploaded
                        </p>
                    </div>
                </div>

                {/* Upload Zone */}
                <div className="mb-8">
                    <DropZone
                        onFiles={uploadFiles}
                        uploading={uploading}
                        uploadProgress={uploadProgress}
                        uploadingName={uploadingName}
                    />
                </div>

                {/* Filter Tabs + Search */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                    {/* Type Filter */}
                    <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                        {(["all", "image", "video", "document"] as FilterType[]).map(
                            (type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilter(type)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filter === type
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-500 hover:bg-gray-100"
                                        }`}
                                >
                                    {type === "image" && <Image className="w-3.5 h-3.5" />}
                                    {type === "video" && <Video className="w-3.5 h-3.5" />}
                                    {type === "document" && <FileText className="w-3.5 h-3.5" />}
                                    {type === "all" && <Filter className="w-3.5 h-3.5" />}
                                    {type}
                                    <span
                                        className={`text-xs px-1.5 py-0.5 rounded-full ${filter === type
                                                ? "bg-white/20 text-white"
                                                : "bg-gray-100 text-gray-500"
                                            }`}
                                    >
                                        {counts[type]}
                                    </span>
                                </button>
                            )
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                <X className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                        )}
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 ml-auto">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${viewMode === "grid"
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-500 hover:bg-gray-100"
                                }`}
                        >
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${viewMode === "list"
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-500 hover:bg-gray-100"
                                }`}
                        >
                            List
                        </button>
                    </div>
                </div>

                {/* Media Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">No files found</p>
                        <p className="text-gray-400 text-sm mt-1">
                            {search
                                ? `No results for "${search}"`
                                : "Upload your first file above"}
                        </p>
                    </div>
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filtered.map((file) => (
                            <MediaCard
                                key={file.id}
                                file={file}
                                onDelete={setDeleteConfirm}
                                onCopy={handleCopy}
                                copied={copied}
                            />
                        ))}
                    </div>
                ) : (
                    /* List View */
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        File
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Size
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Uploaded
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((file) => (
                                    <tr
                                        key={file.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                                                    {getFileType(file.format) === "image" ? (
                                                        <img
                                                            src={file.url}
                                                            alt={file.name || ""}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : getFileType(file.format) === "video" ? (
                                                        <Video className="w-5 h-5 text-purple-500" />
                                                    ) : (
                                                        <FileText className="w-5 h-5 text-orange-500" />
                                                    )}
                                                </div>
                                                <span className="font-medium text-gray-800 truncate max-w-xs">
                                                    {file.name || "Unnamed"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span
                                                className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${typeBadge(file.format)}`}
                                            >
                                                {getFileType(file.format)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-gray-500">
                                            {formatSize(file.size)}
                                        </td>
                                        <td className="px-6 py-3 text-gray-400">
                                            {formatDate(file.created_at)}
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleCopy(file.url)}
                                                    className="flex items-center gap-1 px-2 py-1 text-xs text-[#0037FF] hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    {copied === file.url ? (
                                                        <Check className="w-3 h-3 text-green-500" />
                                                    ) : (
                                                        <Copy className="w-3 h-3" />
                                                    )}
                                                    {copied === file.url ? "Copied" : "Copy URL"}
                                                </button>
                                                <a
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                                <button
                                                    onClick={() => setDeleteConfirm(file)}
                                                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* ── Delete Confirm Modal ── */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
                            Delete File?
                        </h3>
                        <p className="text-sm text-gray-500 text-center mb-1">
                            <strong>{deleteConfirm.name}</strong>
                        </p>
                        <p className="text-xs text-gray-400 text-center mb-6">
                            This removes the file from your media library. The Cloudinary
                            file will remain unless deleted there too.
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

export default AdminMedia;
