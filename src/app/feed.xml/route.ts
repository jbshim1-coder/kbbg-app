import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://kbeautybuyersguide.com";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function GET() {
  const { data: posts } = await getSupabase()
    .from("blog_posts")
    .select("slug, title_en, excerpt_en, image_url, category, published_at")
    .eq("is_published", true)
    .eq("site", "kbbg")
    .order("published_at", { ascending: false })
    .limit(50);

  const items = (posts || [])
    .map((post) => {
      const url = `${BASE_URL}/en/blog/${post.slug}`;
      const pubDate = new Date(post.published_at).toUTCString();
      const desc = (post.excerpt_en || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const title = (post.title_en || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `
    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${desc}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${post.category}</category>
      ${post.image_url ? `<enclosure url="${post.image_url}" type="image/jpeg" length="0"/>` : ""}
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>K-Beauty Buyers Guide — KBBG</title>
    <link>${BASE_URL}/en/blog</link>
    <description>Korean beauty procedures, medical tourism guides, and K-beauty cosmetics rankings.</description>
    <language>en</language>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/icon.png</url>
      <title>KBBG</title>
      <link>${BASE_URL}</link>
    </image>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
