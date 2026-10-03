import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Eye, Loader2, Pencil, Star, Trash2 } from "lucide-react";

import AdminLayout from "../../components/AdminLayout";
import StatusBadge from "../../components/StatusBadge";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

import { blogApi } from "@/services/blog.service";
import type { Blog } from "@/types/blog";

const BlogDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadBlog = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const res = await blogApi.getById(id);
      setBlog(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load blog post.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBlog();
  }, [loadBlog]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      setDeleting(true);
      await blogApi.delete(id);
      toast({ title: "Blog deleted successfully." });
      navigate("/admin/blog");
    } catch (err: any) {
      toast({
        title: "Failed to delete blog",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!id || !blog) return;

    const nextStatus = blog.status === "Published" ? "Draft" : "Published";

    try {
      setUpdatingStatus(true);
      const res = await blogApi.updateStatus(id, nextStatus);
      setBlog(res.data);
      toast({ title: `Post marked as ${nextStatus}.` });
    } catch (err: any) {
      toast({
        title: "Failed to update status",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Blog Post" subtitle=" ">
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading blog post...
        </div>
      </AdminLayout>
    );
  }

  if (error || !blog) {
    return (
      <AdminLayout title="Blog Post" subtitle=" ">
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <p className="text-sm text-muted-foreground">
            {error || "Blog post not found."}
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/blog")}>
            Back to Blog
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={blog.title}
      subtitle={`Created ${new Date(blog.createdAt).toLocaleDateString()} · Last updated ${new Date(
        blog.updatedAt
      ).toLocaleDateString()}`}
      actions={
        <div className="flex items-center gap-2">
          <Link to="/admin/blog">
            <Button variant="outline" size="sm">
              <ArrowLeft size={14} />
              Back
            </Button>
          </Link>

          <Link to={`/admin/blog/${blog._id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil size={14} />
              Edit
            </Button>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 size={14} />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove "{blog.title}" from the blog. This action can't be
                  undone from here.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {blog.thumbnail?.url && (
            <img
              src={blog.thumbnail.url}
              alt={blog.title}
              className="h-72 w-full rounded-xl border border-border object-cover"
            />
          )}

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              Short Description
            </h3>
            <p className="text-sm">{blog.shortDescription}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              Content
            </h3>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {blog.content}
            </div>
          </div>

          {(blog.seoTitle || blog.metaDescription) && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">SEO</h3>

              {blog.seoTitle && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground">SEO Title</p>
                  <p className="text-sm">{blog.seoTitle}</p>
                </div>
              )}

              {blog.metaDescription && (
                <div>
                  <p className="text-xs text-muted-foreground">Meta Description</p>
                  <p className="text-sm">{blog.metaDescription}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">Status</h3>

            <div className="mb-4 flex items-center justify-between">
              <StatusBadge>{blog.status}</StatusBadge>
              {blog.featured && (
                <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                  <Star size={12} fill="currentColor" />
                  Featured
                </span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleToggleStatus}
              disabled={updatingStatus}
            >
              {updatingStatus
                ? "Updating..."
                : blog.status === "Published"
                ? "Move to Draft"
                : "Publish Now"}
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">Details</h3>

            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Category</dt>
                <dd className="font-medium">{blog.category}</dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Read time</dt>
                <dd className="font-medium">{blog.readTime} min</dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Views</dt>
                <dd className="flex items-center gap-1 font-medium">
                  <Eye size={13} />
                  {blog.views}
                </dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Slug</dt>
                <dd className="max-w-[60%] truncate font-medium" title={blog.slug}>
                  {blog.slug}
                </dd>
              </div>
            </dl>
          </div>

          {blog.tags?.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default BlogDetailPage;