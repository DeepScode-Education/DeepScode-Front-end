import { useCallback, useEffect, useState } from "react";
import { blogApi } from "@/services/blog.service";
import type { Blog, BlogPayload, BlogQuery } from "@/types/blog";

export const useBlogs = (initialQuery?: BlogQuery) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(initialQuery?.page ?? 1);
  const [limit, setLimit] = useState(initialQuery?.limit ?? 10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState<BlogQuery>({
    search: initialQuery?.search ?? "",
    category: initialQuery?.category ?? "",
    status: initialQuery?.status ?? "",
    featured: initialQuery?.featured,
  });

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await blogApi.getAll({
        page,
        limit,
        search: filters.search,
        category: filters.category,
        status: filters.status,
        featured: filters.featured,
      });

      setBlogs(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      setError(err.message || "Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    filters.search,
    filters.category,
    filters.status,
    filters.featured,
  ]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const createBlog = async (payload: BlogPayload) => {
    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("title", payload.title);
      formData.append("shortDescription", payload.shortDescription);
      formData.append("content", payload.content);
      if (payload.course) formData.append("course", payload.course);

      if (payload.status)
        formData.append("status", payload.status);

      if (payload.featured !== undefined)
        formData.append("featured", String(payload.featured));

      if (payload.readTime)
        formData.append("readTime", String(payload.readTime));

      if (payload.seoTitle)
        formData.append("seoTitle", payload.seoTitle);

      if (payload.metaDescription)
        formData.append("metaDescription", payload.metaDescription);

      payload.tags?.forEach((tag) => formData.append("tags", tag));

      if (payload.thumbnail) {
        formData.append("thumbnail", payload.thumbnail);
      }

      const res = await blogApi.create(formData);

      await fetchBlogs();

      return res.data;
    } finally {
      setSaving(false);
    }
  };

  const updateBlog = async (
    id: string,
    payload: BlogPayload
  ) => {
    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("title", payload.title);
      formData.append("shortDescription", payload.shortDescription);
      formData.append("content", payload.content);
      if (payload.course) formData.append("course", payload.course);

      if (payload.status)
        formData.append("status", payload.status);

      if (payload.featured !== undefined)
        formData.append("featured", String(payload.featured));

      if (payload.readTime)
        formData.append("readTime", String(payload.readTime));

      if (payload.seoTitle)
        formData.append("seoTitle", payload.seoTitle);

      if (payload.metaDescription)
        formData.append("metaDescription", payload.metaDescription);

      payload.tags?.forEach((tag) => formData.append("tags", tag));

      if (payload.thumbnail) {
        formData.append("thumbnail", payload.thumbnail);
      }

      const res = await blogApi.update(id, formData);

      await fetchBlogs();

      return res.data;
    } finally {
      setSaving(false);
    }
  };

  const deleteBlog = async (id: string) => {
    await blogApi.delete(id);
    await fetchBlogs();
  };

  const updateStatus = async (
    id: string,
    status: "Draft" | "Published"
  ) => {
    await blogApi.updateStatus(id, status);
    await fetchBlogs();
  };

  return {
    blogs,
    loading,
    saving,
    error,

    page,
    setPage,

    limit,
    setLimit,

    total,
    totalPages,

    filters,
    setFilters,

    fetchBlogs,

    createBlog,
    updateBlog,
    deleteBlog,
    updateStatus,
  };
};