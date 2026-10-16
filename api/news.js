const SOURCES = [
  { name: "OpenAI", url: "https://openai.com/news/rss.xml", hosts: ["openai.com"] },
  { name: "Google AI", url: "https://blog.google/innovation-and-ai/technology/ai/rss/", hosts: ["blog.google", "googleblog.com"] }
];

function decodeXml(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/<[^>]*>/g, "").trim();
}

function tag(block, names) {
  for (const name of names) {
    const match = block.match(new RegExp("<" + name + "(?:\\s[^>]*)?>([\\s\\S]*?)</" + name + "\\s*>", "i"));
    if (match) return match[1];
  }
  return "";
}

function feedItems(xml, source) {
  const blocks = xml.match(/<(?:item|entry)(?:\s[^>]*)?>[\s\S]*?<\/(?:item|entry)\s*>/gi) || [];
  return blocks.map(block => {
    const title = decodeXml(tag(block, ["title"]));
    let rawLink = tag(block, ["link"]);
    if (!rawLink) {
      const linkTag = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*\/?\s*>/i);
      rawLink = linkTag ? linkTag[1] : "";
    }
    const link = decodeXml(rawLink);
    const date = decodeXml(tag(block, ["pubDate", "published", "updated", "dc:date"]));
    const publishedAt = date ? new Date(date) : null;
    let parsed;
    try { parsed = new URL(link); } catch { return null; }
    if (!title || parsed.protocol !== "https:" ||
        !source.hosts.some(host => parsed.hostname === host || parsed.hostname.endsWith("." + host)) ||
        !publishedAt || !Number.isFinite(publishedAt.getTime())) return null;
    return { title, url: parsed.href, publishedAt: publishedAt.toISOString(), source: source.name };
  }).filter(Boolean);
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=86400");
  const results = await Promise.all(SOURCES.map(async source => {
    try {
      const response = await fetch(source.url, {
        headers: { "User-Agent": "AI-Radar/1.0 (+official RSS reader)" },
        signal: AbortSignal.timeout(8000)
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const xml = await response.text();
      const items = feedItems(xml, source);
      return { source: source.name, ok: true, items };
    } catch {
      return { source: source.name, ok: false, items: [] };
    }
  }));
  const items = results.flatMap(result => result.items)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 20);
  res.status(200).json({
    fetchedAt: new Date().toISOString(),
    sources: results.map(({ source, ok }) => ({ source, ok })),
    items
  });
};
