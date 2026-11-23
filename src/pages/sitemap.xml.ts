import { getCollection } from "astro:content";

const SITE = "https://digvijay.online";

// A plain sitemap so search engines can find every public page without a plugin.
export async function GET() {
  const works = (await getCollection("work")).filter((entry) => !entry.data.hidden);
  const paths = ["/", "/impressum/", "/privacy/", ...works.sort((a, b) => a.data.order - b.data.order).map((entry) => `/work/${entry.id}/`)];
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    paths.map((path) => `  <url><loc>${SITE}${path}</loc></url>`).join("\n") +
    `\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
