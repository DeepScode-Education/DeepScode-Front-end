import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/client';

import HeroSection from '@/components/home/HeroSection';
import TrustSection from '@/components/home/TrustSection';
import Testimonials from '@/components/home/Testimonials';
import FeaturedCourses from '@/components/home/FeaturedCourses';
import CategorySection from '@/components/home/CategorySection';
import FinalCTA from '@/components/home/FinalCTA';

type SiteContentRecord = {
    id: string;
    page: string;
    section: string;
    type?: string;
    content: any;
    order_index?: number;
};

const componentMap: Record<string, React.ComponentType<any>> = {
    hero: HeroSection,
    'hero section': HeroSection,
    // 'why choose us' removed
    trust: TrustSection,
    testimonials: Testimonials,
    'featured courses': FeaturedCourses,
    categories: CategorySection,
    'category section': CategorySection,
    'final cta': FinalCTA,
    cta: FinalCTA,
};

export default function HomePage() {
    const { data, isLoading, isError, error } = useQuery<SiteContentRecord[]>({
        queryKey: ['site_content', 'home'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('site_content')
                .select('*')
                .in('page', ['home', 'homepage'])
                .order('order_index', { ascending: true });
            if (error) throw error;
            return (data as SiteContentRecord[]) || [];
        },
    });

    if (isLoading) {
        return (
            <div className="container py-20">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-40 bg-gray-200 rounded" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container py-20 text-center text-destructive">
                <h2 className="text-xl font-semibold">Failed to load homepage content</h2>
                <p className="mt-2">{(error as any)?.message || 'An unexpected error occurred.'}</p>
            </div>
        );
    }

    const rows = data || [];

    return (
        <main>
            {rows.length === 0 && (
                <div className="container py-20 text-center text-muted-foreground">
                    No content configured for the homepage yet.
                </div>
            )}

            {rows.map((row) => {
                const key = (row.section || row.type || '').toLowerCase().trim();
                const Component = componentMap[key] || componentMap[row.section?.toLowerCase().trim() as string];

                // If no mapped component, render nothing (or a simple wrapper)
                if (!Component) {
                    return (
                        <div className="container py-8" key={row.id}>
                            {/* Unknown section: render nothing or provide a debug placeholder */}
                        </div>
                    );
                }

                // Use React.createElement with `as any` to avoid strict prop checks.
                return (
                    <div key={row.id}>
                        {React.createElement(Component as any, { data: row.content })}
                    </div>
                );
            })}
        </main>
    );
}
