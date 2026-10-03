import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { publicBlogApi } from "@/services/publicBlog.service";
import type { Blog as BlogPost } from "@/types/blog";
import { useSsrData } from "@/ssr/SsrDataContext";

const BlogDetailPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const ssrPost = useSsrData<BlogPost>("blogData");

    const [post, setPost] = useState<BlogPost | null>(() =>
        ssrPost?.slug === slug ? ssrPost : null
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) {
            setPost(null);
            setLoading(false);
            return;
        }

        let cancelled = false;
        const initialPost = ssrPost?.slug === slug ? ssrPost : null;

        setPost(initialPost);
        setLoading(!initialPost);
        setError(null);

        publicBlogApi
            .getBySlug(slug)
            .then((res) => {
                if (!cancelled) setPost(res.data.data);
            })
            .catch((err) => {
                if (cancelled) return;
                if (err?.response?.status === 404) {
                    setError("This post doesn't exist or has been unpublished.");
                } else {
                    setError(
                        err?.response?.data?.message ||
                            "Couldn't load this post. Please try again."
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [slug, ssrPost]);

    // SSR provides the initial head tags; this keeps them correct during SPA navigation.
    useEffect(() => {
        const descriptionMetas = Array.from(
            document.querySelectorAll<HTMLMetaElement>('meta[name="description"]')
        );
        descriptionMetas.slice(1).forEach((duplicate) => duplicate.remove());

        if (!post) {
            document.title = "Slate Academy";
            descriptionMetas.forEach((meta) => meta.remove());
            return;
        }

        const meta = descriptionMetas[0] ?? document.createElement("meta");
        if (!meta.isConnected) {
            meta.name = "description";
            document.head.appendChild(meta);
        }

        document.title = post.seoTitle || post.title;
        meta.content = post.metaDescription || post.shortDescription;

        return () => {
            document.title = "Slate Academy";
            document.querySelectorAll('meta[name="description"]').forEach((descriptionMeta) => {
                descriptionMeta.remove();
            });
        };
    }, [post]);

    if (loading) {
        return (
            <main className="container py-24">
                <div className="mx-auto max-w-3xl animate-pulse space-y-4">
                    <div className="h-6 w-24 rounded bg-accent" />
                    <div className="h-10 w-3/4 rounded bg-accent" />
                    <div className="aspect-video w-full rounded-xl bg-accent" />
                    <div className="h-4 w-full rounded bg-accent" />
                    <div className="h-4 w-5/6 rounded bg-accent" />
                </div>
            </main>
        );
    }

    if (error || !post) {
        return (
            <main className="container py-24 text-center">
                <p className="text-muted-foreground">{error}</p>
                <Link to="/blog">
                    <Button variant="link" className="mt-4">
                        ← Back to Blog
                    </Button>
                </Link>
            </main>
        );
    }

    return (
        <main>
            <article className="container max-w-3xl py-16 md:py-24">
                {/* <Link to="/blog">
                    <Button variant="link" className="mb-6 h-auto p-0 text-sm">
                        ← Back to Blog
                    </Button>
                </Link> */}

                <span className="text-xs md:text-lg  font-medium lg:font-semibold text-black ">
                    {post.category}
                </span>

                <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl text-black">
                    {post.title}
                </h1>

                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{post.readTime} min read</span>
                    <span className="flex items-center gap-1">
                        <Eye size={14} />
                        {post.views} views
                    </span>
                    <span>
                        {new Date(post.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </span>
                </div>

                {post.thumbnail?.url && (
                    <img
                        src={post.thumbnail.url}
                        alt={post.title}
                        className="mt-8 aspect-video w-full rounded-xl object-cover"
                    />
                )}

                <p className="mt-8 text-lg text-muted-foreground">
                    {post.shortDescription}
                </p>

                <div className="prose prose-neutral mt-6 max-w-none whitespace-pre-wrap leading-relaxed">
                    {post.content}
                </div>

                {post.tags?.length > 0 && (
                    <div className="mt-10 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </article>
        </main>
    );
};

export default BlogDetailPage;