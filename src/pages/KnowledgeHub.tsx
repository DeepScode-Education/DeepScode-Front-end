
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Video, Search, ArrowRight } from "lucide-react";
import { useState } from "react";

const resources = [
    { type: "Guide", icon: BookOpen, title: "UI/UX Design Principles for Beginners", category: "Design", read: "8 min read" },
    { type: "Article", icon: FileText, title: "How to Build Your First React App in 2026", category: "3D", read: "12 min read" },
    { type: "Video", icon: Video, title: "Performance Marketing Funnel Explained", category: "Marketing", read: "15 min watch" },
    { type: "Guide", icon: BookOpen, title: "Python for Data Analytics: Cheat Sheet", category: "Data", read: "6 min read" },
    { type: "Article", icon: FileText, title: "10 Figma Plugins Every Designer Should Use", category: "Design", read: "5 min read" },
    { type: "Video", icon: Video, title: "Mastering SEO in 2026: Complete Walkthrough", category: "Marketing", read: "22 min watch" },
    { type: "Guide", icon: BookOpen, title: "MERN Stack Roadmap for Full Stack Devs", category: "3D", read: "10 min read" },
    { type: "Article", icon: FileText, title: "Excel Dashboards: From Zero to Pro", category: "Data", read: "9 min read" },
    { type: "Video", icon: Video, title: "Building a Portfolio That Gets You Hired", category: "Design", read: "18 min watch" },
];

const categories = ["All", "Design", "3D", "Marketing", "Data"];

const KnowledgeHub = () => {
    const [query, setQuery] = useState("");
    const [active, setActive] = useState("All");

    const filtered = resources.filter((r) => {
        const matchesCat = active === "All" || r.category === active;
        const matchesQ = r.title.toLowerCase().includes(query.toLowerCase());
        return matchesCat && matchesQ;
    });

    return (
        <div className="min-h-screen bg-background">
    
            <main className="container py-16">
                <header className="mx-auto max-w-3xl text-center">
                    <Badge variant="secondary" className="mb-4">Free Learning Library</Badge>
                    <h1 className="text-2xl font-bold tracking-tight text-black md:text-4xl">Knowledge Hub</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Guides, articles, and videos to level up your skills — curated by industry experts.
                    </p>
                </header>

                <div className="mx-auto mt-8 flex max-w-xl items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search articles, guides, videos…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-2 text-gray">
                    {categories.map((c) => (
                        <Button
                            key={c}
                           className={`rounded-full h-11 px-6 transition-all duration-300 ${
  active === c
    ? "bg-[#0037FF] text-white shadow-md hover:bg-[#0030db]"
    : "bg-white border border-slate-200 text-slate-700 hover:border-[#0037FF] hover:text-white"
}`}
                            size="sm"
                            onClick={() => setActive(c)}
                        >
                            {c}
                        </Button>
                    ))}
                </div>

                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((r) => (
                        <Card key={r.title} className="group cursor-pointer transition hover:-translate-y-1 hover:shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <r.icon className="h-4 w-4 text-[#0037FF]" />
                                    <span>{r.type}</span>
                                    <span>·</span>
                                    <span>{r.read}</span>
                                </div>
                                <h3 className="mt-3 line-clamp-2 text-lg font-semibold text-foreground group-hover:text-[#0037FF]">
                                    {r.title}
                                </h3>
                                <div className="mt-4 flex items-center justify-between">
                                    <Badge variant="outline">{r.category}</Badge>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-[#0037FF]" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <p className="mt-10 text-center text-muted-foreground">No resources match your search.</p>
                )}
            </main>

        </div>
    );
};

export default KnowledgeHub;