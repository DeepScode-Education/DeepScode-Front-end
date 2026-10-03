import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Star, Trash2 } from "lucide-react";

import AdminLayout from "../../components/AdminLayout";
import StatusBadge from "../../components/StatusBadge";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import { useBlogs } from "@/hooks/useBlogs";
import { useCategories } from "@/hooks/useCategories";
import type { Blog as BlogType } from "@/types/blog";

const ALL_CATEGORIES_VALUE = "all";

const Blog = () => {
  const {
    blogs,
    loading,
    setFilters,
    deleteBlog,
  } = useBlogs();

  const { categories } = useCategories();

  const navigate = useNavigate();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES_VALUE);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search,
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: category === ALL_CATEGORIES_VALUE ? "" : category,
    }));
  }, [category]);

  const handleDelete = async (blog: BlogType) => {
    try {
      setDeletingId(blog._id);
      await deleteBlog(blog._id);
      toast({ title: "Blog deleted successfully." });
    } catch (err: any) {
      toast({
        title: "Failed to delete blog",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout
      title="Blog"
      subtitle="Write, schedule, and publish posts."
      actions={
        <Link to="/admin/blog/new">
          <Button className="text-white" size="sm">
            <Plus size={14} />
            New Post
          </Button>
        </Link>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />

          <Input
            placeholder="Search posts..."
            className="h-9 pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES_VALUE}>All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Title</th>
              <th className="px-5 py-3 text-left font-medium">Category</th>
              <th className="px-5 py-3 text-left font-medium">Status</th>
              <th className="px-5 py-3 text-left font-medium">Views</th>
              <th className="px-5 py-3 text-left font-medium">Created</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  Loading blogs...
                </td>
              </tr>
            ) : blogs.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  No blogs found.
                </td>
              </tr>
            ) : (
              blogs.map((blog) => (
                <tr
                  key={blog._id}
                  className="cursor-pointer border-t border-border hover:bg-secondary/30"
                  onClick={() => navigate(`/admin/blog/${blog._id}`)}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={blog.thumbnail?.url}
                        alt={blog.title}
                        className="h-12 w-16 rounded object-cover"
                      />

                      <div>
                        <p className="flex items-center gap-1.5 font-medium">
                          {blog.title}
                          {blog.featured && (
                            <Star
                              size={12}
                              className="text-amber-500"
                              fill="currentColor"
                            />
                          )}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {blog.readTime} min read
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3">{blog.category}</td>

                  <td className="px-5 py-3">
                    <StatusBadge>{blog.status}</StatusBadge>
                  </td>

                  <td className="px-5 py-3">{blog.views}</td>

                  <td className="px-5 py-3">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </td>

                  <td
                    className="px-5 py-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/admin/blog/${blog._id}/edit`}>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </Link>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove "{blog.title}" from the blog. This
                              action can't be undone from here.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(blog)}
                              disabled={deletingId === blog._id}
                            >
                              {deletingId === blog._id ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default Blog;