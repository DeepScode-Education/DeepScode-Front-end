// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";

// import { Button } from "@/components/ui/button";
// import { publicBlogApi } from "../services/publicBlog.service";
// import type { Blog as BlogPost } from "@/types/blog";

// const categories = ["All", "Design", "Coding", "Marketing", "Data"] as const;

// const BlogPage = () => {
//   const [active, setActive] = useState<string>("All");

//   const [featured, setFeatured] = useState<BlogPost[]>([]);
//   const [featuredLoading, setFeaturedLoading] = useState(true);

//   const [posts, setPosts] = useState<BlogPost[]>([]);
//   const [postsLoading, setPostsLoading] = useState(true);
//   const [postsError, setPostsError] = useState<string | null>(null);

//   const [email, setEmail] = useState("");

//   // Featured posts — fetched once
//   useEffect(() => {
//     setFeaturedLoading(true);

//     publicBlogApi
//       .getFeatured()
//       .then((res) => {
//         setFeatured(res.data.data);
//       })
//       .catch((err) => {
//         console.error("Failed to load featured posts:", err);
//       })
//       .finally(() => {
//         setFeaturedLoading(false);
//       });
//   }, []);

//   // All posts — refetched whenever the active category changes
//   useEffect(() => {
//     setPostsLoading(true);
//     setPostsError(null);

//     publicBlogApi
//       .getAll({ category: active })
//       .then((res) => {
//         setPosts(res.data.data);
//       })
//       .catch((err) => {
//         setPostsError(
//           err?.response?.data?.message ||
//             "Couldn't load blog posts. Please try again.",
//         );
//       })
//       .finally(() => {
//         setPostsLoading(false);
//       });
//   }, [active]);

//   const handleSubscribe = () => {
//     // Newsletter signup isn't backed by an endpoint yet — placeholder hook.
//     setEmail("");
//   };

//   return (
//     <>
//       <main>
//         {/* Hero */}
//         <section className="container text-center p-8 bg-red-50/15">
//           <h1 className="animate-fade-up text-4xl font-extrabold tracking-tight md:text-5xl lg:text-5xl">
//             <span className="text-[#0037FF]">Learn, Explore, Grow</span>
//           </h1>
//           <p className="animate-fade-up-delay-1 mx-auto mt-5 max-w-xl text-sm md:text-lg font-medium lg:font-semibold text-gray-800 ">
//             Insights on design, coding, marketing & data.
//           </p>
//         </section>

//         {/* Featured Posts */}
//         {(featuredLoading || featured.length > 0) && (
//           <section className="bg-muted/30">
//             <div className="container py-8">
//               <h2 className="animate-fade-up text-2xl font-bold">Featured</h2>

//               {featuredLoading ? (
//                 <div className="mt-8 grid gap-6 md:grid-cols-3">
//                   {[0, 1, 2].map((i) => (
//                     <div
//                       key={i}
//                       className="h-64 animate-pulse rounded-xl border border-border bg-card"
//                     />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="mt-8 grid gap-6 md:grid-cols-3">
//                   {featured.map((post, i) => (
//                     <Link
//                       to={`/blog/${post.slug}`}
//                       key={post._id}
//                       className={`group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg ${
//                         i === 0
//                           ? "animate-fade-up"
//                           : i === 1
//                             ? "animate-fade-up-delay-1"
//                             : "animate-fade-up-delay-2"
//                       }`}
//                     >
//                       {post.thumbnail?.url ? (
//                         <img
//                           src={post.thumbnail.url}
//                           alt={post.title}
//                           className="aspect-video w-full object-cover"
//                         />
//                       ) : (
//                         <div className="aspect-video bg-accent" />
//                       )}
//                       <div className="p-5">
//                         <span className="text-xs font-medium text-[#0037FF]">
//                           {post.category}
//                         </span>
//                         <h3 className="mt-2 font-semibold leading-snug group-hover:text-[#0037FF] transition-colors">
//                           {post.title}
//                         </h3>
//                         <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
//                           {post.shortDescription}
//                         </p>
//                         <Button
//                           variant="link"
//                           className="mt-3 h-auto p-0 text-sm"
//                         >
//                           Read More →
//                         </Button>
//                       </div>
//                     </Link>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </section>
//         )}

//         {/* Categories + All Posts */}
//         <section className="container py-16">
//           <h2 className="animate-fade-up text-2xl font-bold">All Posts</h2>
//           <div className="mt-6 flex flex-wrap gap-2">
//             {categories.map((cat) => (
//               <button
//                 key={cat}
//                 onClick={() => setActive(cat)}
//                 className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
//                   active === cat
//                     ? "bg-[#0037FF] text-white"
//                     : "bg-white text-black border border-gray-300 hover:bg-gray-100"
//                 }`}
//               >
//                 {cat}
//               </button>
//             ))}
//           </div>

//           {postsLoading ? (
//             <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
//               {[0, 1, 2, 3, 4, 5].map((i) => (
//                 <div
//                   key={i}
//                   className="h-44 animate-pulse rounded-xl border border-border bg-card"
//                 />
//               ))}
//             </div>
//           ) : postsError ? (
//             <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
//               {postsError}
//             </div>
//           ) : posts.length === 0 ? (
//             <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
//               No posts in this category yet.
//             </div>
//           ) : (
//             <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
//               {posts.map((post, idx) => (
//                 <Link
//                   to={`/blog/${post.slug}`}
//                   key={post._id}
//                   className={`rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md ${
//                     idx < 3 ? "animate-fade-up" : "animate-fade-up-delay-1"
//                   }`}
//                 >
//                   <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                     <span className="rounded-full bg-accent px-2 py-0.5 font-medium text-[#0037FF]">
//                       {post.category}
//                     </span>
//                     <span>{post.readTime} min read</span>
//                   </div>
//                   <h3 className="mt-3 font-semibold leading-snug">
//                     {post.title}
//                   </h3>
//                   <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
//                     {post.shortDescription}
//                   </p>
//                   <Button variant="link" className="mt-3 h-auto p-0 text-sm">
//                     Read →
//                   </Button>
//                 </Link>
//               ))}
//             </div>
//           )}
//         </section>

//         {/* Newsletter */}
//         <section className="bg-[#0037FF]">
//           <div className="container py-16 text-center">
//             <h2 className="text-2xl font-bold text-white">Stay Updated</h2>
//             <p className="mx-auto mt-3 max-w-md text-white/70">
//               Get the latest articles, tips, and resources delivered to your
//               inbox.
//             </p>
//             <div className="mx-auto mt-6 flex max-w-sm gap-2">
//               <input
//                 type="email"
//                 placeholder="your@email.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="flex-1 rounded-lg border-0 bg-[#0037FF]-foreground/20 px-4 py-2.5 text-sm text-[#0037FF]-foreground placeholder:text-[#0037FF]-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary-foreground/40"
//               />
//               <Button variant="secondary" onClick={handleSubscribe}>
//                 Subscribe
//               </Button>
//             </div>
//           </div>
//         </section>
//       </main>
//     </>
//   );
// };

// export default BlogPage;






import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { publicBlogApi } from "../services/publicBlog.service";
import { useCourses } from "@/hooks/useCourses";
import type { Blog as BlogPost } from "@/types/blog";

const BlogPage = () => {
  // CHANGED — empty string = "All". Otherwise holds a Course _id.
  const [activeCourseId, setActiveCourseId] = useState<string>("");

  const { courses } = useCourses(); // NEW — dynamic course list, replaces hardcoded categories

  const [featured, setFeatured] = useState<BlogPost[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  const [email, setEmail] = useState("");

  // Featured posts — fetched once
  useEffect(() => {
    let cancelled = false;

    setFeaturedLoading(true);

    publicBlogApi
      .getFeatured()
      .then((res) => {
        if (!cancelled) setFeatured(res.data.data);
      })
      .catch((err) => {
        if (!cancelled) console.error("Failed to load featured posts:", err);
      })
      .finally(() => {
        if (!cancelled) setFeaturedLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // All posts — refetched whenever the active course filter changes.
  // FIX: `cancelled` guard prevents a slow/older request from overwriting
  // the result of a newer one when the user switches filters quickly —
  // this was causing "All Posts" to sometimes show stale/wrong results.
  useEffect(() => {
    let cancelled = false;

    setPostsLoading(true);
    setPostsError(null);

    publicBlogApi
      .getAll({ course: activeCourseId || undefined })
      .then((res) => {
        if (cancelled) return;
        setPosts(res.data.data);
      })
      .catch((err) => {
        if (cancelled) return;
        setPostsError(
          err?.response?.data?.message ||
            "Couldn't load blog posts. Please try again.",
        );
      })
      .finally(() => {
        if (!cancelled) setPostsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCourseId]);

  const handleSubscribe = () => {
    // Newsletter signup isn't backed by an endpoint yet — placeholder hook.
    setEmail("");
  };

  // Small helper so a card always shows *something* meaningful even for
  // legacy blogs that have no `course` linked yet.
  const badgeLabel = (post: BlogPost) => post.course?.title || post.category || "General";

  return (
    <>
      <main>
        {/* Hero */}
        <section className="container text-center p-8 bg-red-50/15">
          <h1 className="animate-fade-up text-4xl font-extrabold tracking-tight md:text-5xl lg:text-5xl">
            <span className="text-[#0037FF]">Learn, Explore, Grow</span>
          </h1>
          <p className="animate-fade-up-delay-1 mx-auto mt-5 max-w-xl text-sm md:text-lg font-medium lg:font-semibold text-gray-800 ">
            Insights on design, coding, marketing & data.
          </p>
        </section>

        {/* Featured Posts */}
        {(featuredLoading || featured.length > 0) && (
          <section className="bg-muted/30">
            <div className="container py-8">
              <h2 className="animate-fade-up text-2xl font-bold">Featured</h2>

              {featuredLoading ? (
                <div className="mt-8 grid gap-6 md:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-64 animate-pulse rounded-xl border border-border bg-card"
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-8 grid gap-6 md:grid-cols-3">
                  {featured.map((post, i) => (
                    <Link
                      to={`/blog/${post.slug}`}
                      key={post._id}
                      className={`group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg ${
                        i === 0
                          ? "animate-fade-up"
                          : i === 1
                            ? "animate-fade-up-delay-1"
                            : "animate-fade-up-delay-2"
                      }`}
                    >
                      {post.thumbnail?.url ? (
                        <img
                          src={post.thumbnail.url}
                          alt={post.title}
                          className="aspect-video w-full object-cover"
                        />
                      ) : (
                        <div className="aspect-video bg-accent" />
                      )}
                      <div className="p-5">
                        <span className="text-xs font-medium text-[#0037FF]">
                          {badgeLabel(post)}
                        </span>
                        <h3 className="mt-2 font-semibold leading-snug group-hover:text-[#0037FF] transition-colors">
                          {post.title}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {post.shortDescription}
                        </p>
                        <Button
                          variant="link"
                          className="mt-3 h-auto p-0 text-sm"
                        >
                          Read More →
                        </Button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Courses + All Posts */}
        <section className="container py-16">
          <h2 className="animate-fade-up text-2xl font-bold">All Posts</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCourseId("")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCourseId === ""
                  ? "bg-[#0037FF] text-white"
                  : "bg-white text-black border border-gray-300 hover:bg-gray-100"
              }`}
            >
              All
            </button>
            {courses.map((c) => (
              <button
                type="button"
                key={c._id}
                onClick={() => setActiveCourseId(c._id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCourseId === c._id
                    ? "bg-[#0037FF] text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>

          {postsLoading ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-44 animate-pulse rounded-xl border border-border bg-card"
                />
              ))}
            </div>
          ) : postsError ? (
            <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              {postsError}
            </div>
          ) : posts.length === 0 ? (
            <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No posts in this category yet.
            </div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, idx) => (
                <Link
                  to={`/blog/${post.slug}`}
                  key={post._id}
                  className={`rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md ${
                    idx < 3 ? "animate-fade-up" : "animate-fade-up-delay-1"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-accent px-2 py-0.5 font-medium text-[#0037FF]">
                      {badgeLabel(post)}
                    </span>
                    <span>{post.readTime} min read</span>
                  </div>
                  <h3 className="mt-3 font-semibold leading-snug">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {post.shortDescription}
                  </p>
                  <Button variant="link" className="mt-3 h-auto p-0 text-sm">
                    Read →
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Newsletter */}
        <section className="bg-[#0037FF]">
          <div className="container py-16 text-center">
            <h2 className="text-2xl font-bold text-white">Stay Updated</h2>
            <p className="mx-auto mt-3 max-w-md text-white/70">
              Get the latest articles, tips, and resources delivered to your
              inbox.
            </p>
            <div className="mx-auto mt-6 flex max-w-sm gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-lg border-0 bg-[#0037FF]-foreground/20 px-4 py-2.5 text-sm text-[#0037FF]-foreground placeholder:text-[#0037FF]-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary-foreground/40"
              />
              <Button variant="secondary" onClick={handleSubscribe}>
                Subscribe
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default BlogPage;