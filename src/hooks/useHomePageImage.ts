// src/hooks/useHeroSection.ts

import { useState, useEffect } from "react";
import { siteContentApi } from "@/integrations/client";

interface HeroButton {
    text: string;
    link: string;
}

interface HeroSectionData {
    title: string;
    subtitle: string;
    image: string | null;
    alt: string | null;
    buttons: HeroButton[];
}

let cachedHero: HeroSectionData | null = null;

let fetchPromise: Promise<HeroSectionData | null> | null = null;

export const useHeroSection = () => {
    const [heroData, setHeroData] =
        useState<HeroSectionData | null>(cachedHero);

    const [loading, setLoading] = useState(!cachedHero);

    useEffect(() => {
        if (cachedHero) {
            setHeroData(cachedHero);
            setLoading(false);
            return;
        }

        if (!fetchPromise) {
            fetchPromise = (async () => {
                try {
                    const data = await siteContentApi.getSection("home", "hero");
                    if (!data) return null;
                    const content = data.content as any;

                    cachedHero = {
                        title: content?.title || "Career Oriented Courses After 10th & 12th.",
                        subtitle: content?.subtitle || "Explore career oriented courses.",
                        image: content?.hero_image_url || null,
                        alt: content?.hero_image_alt || "Hero Image",
                        buttons: content?.buttons || [
                            { text: "Explore Courses", link: "/courses" },
                            { text: "Start Your Career", link: "/login" },
                        ],
                    };

                    return cachedHero;
                } catch (err) {
                    console.error(err);
                    return null;
                }
            })();
        }

        fetchPromise.then((result) => {
            if (result) {
                setHeroData(result);
            }

            setLoading(false);
        });
    }, []);

    return {
        heroData,
        loading,
    };
};