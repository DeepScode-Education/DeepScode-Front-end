import { useEffect, useState } from "react";
import { siteContentApi } from "@/integrations/client";

interface SectionContent {
    title?: string;
    html?: string;
    text?: string;
    image_url?: string;
    background_color?: string;
    text_color?: string;
    button_text?: string;
    button_url?: string;
    subtitle?: string;
}

interface PageSection {
    id: string;
    page: string;
    section: string;
    type: string;
    content: SectionContent;
    order_index: number;
}

export const useSiteContent = (page: string) => {
    const [sections, setSections] = useState<PageSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [sectionMap, setSectionMap] = useState<Record<string, PageSection>>({});

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                const data = await siteContentApi.getSectionsByPage(page);
                const fetched = (data as PageSection[]) || [];
                setSections(fetched);

                const map: Record<string, PageSection> = {};
                fetched.forEach((s) => {
                    map[s.section] = s;
                });
                setSectionMap(map);
            } catch (error) {
                console.error(`Failed to load content for page: ${page}`, error);
            }
            setLoading(false);
        };

        fetchContent();
    }, [page]);

    // Helper to get a single section by name
    const getSection = (sectionName: string): PageSection | null => {
        return sectionMap[sectionName] ?? null;
    };

    // Helper to get content of a section directly
    const getContent = (sectionName: string): SectionContent => {
        return sectionMap[sectionName]?.content ?? {};
    };

    return { sections, sectionMap, loading, getSection, getContent };
};
