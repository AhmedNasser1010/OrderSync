import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DOCS_DIR = path.resolve(process.cwd(), "../docs");

export interface DocMeta {
  slug: string;
  title: string;
  excerpt: string;
}

export interface Doc extends DocMeta {
  content: string;
}

function getAllDocFiles(): string[] {
  return fs
    .readdirSync(DOCS_DIR)
    .filter((file) => file.endsWith(".md"))
    .sort();
}

function slugFromFilename(filename: string): string {
  return filename.replace(/\.md$/, "");
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].replace(/[`*_#]/g, "").trim() : "Untitled";
}

function extractExcerpt(content: string, maxLength = 160): string {
  const lines = content.split("\n").filter((l) => l.trim());
  const bodyLines = lines.filter(
    (l) => !l.startsWith("#") && !l.startsWith("```") && !l.startsWith("---")
  );
  const text = bodyLines.join(" ").replace(/[*_`#\[\]]/g, "").trim();
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

export function getAllDocs(): DocMeta[] {
  return getAllDocFiles().map((file) => {
    const raw = fs.readFileSync(path.join(DOCS_DIR, file), "utf-8");
    const { data } = matter(raw);
    const slug = slugFromFilename(file);
    const title =
      (data.title as string) || extractTitle(raw);
    const excerpt = extractExcerpt(raw);

    return { slug, title, excerpt };
  });
}

export function getDocBySlug(slug: string): Doc | null {
  const filename = `${slug}.md`;
  const filePath = path.join(DOCS_DIR, filename);

  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const title =
    (data.title as string) || extractTitle(raw);
  const excerpt = extractExcerpt(raw);

  return { slug, title, excerpt, content };
}
