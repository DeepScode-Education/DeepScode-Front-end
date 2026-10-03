// scripts/generate-sitemap-index.js
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const SITE_URL = 'https://slateacademy.com';
const URLS_PER_SITEMAP = 50000; // Max 50,000 URLs per sitemap

const generateSitemapIndex = async () => {
    const { supabase } = await import('../src/integrations/supabase/client.js');

    // Get total count
    const { count } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

    const totalSitemaps = Math.ceil((count + 10) / URLS_PER_SITEMAP);

    let indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    for (let i = 1; i <= totalSitemaps; i++) {
        indexXml += `
  <sitemap>
    <loc>${SITE_URL}/sitemap-${i}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
    }

    indexXml += `
</sitemapindex>`;

    writeFileSync(resolve(process.cwd(), 'public', 'sitemap-index.xml'), indexXml);
    console.log('✅ Sitemap index generated!');
};

generateSitemapIndex();