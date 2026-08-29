const MAX_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" },
  });
}

function corsHeaders(): Headers {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Filename, X-Folder");
  return headers;
}

function normalizeExt(filename: string): string {
  const idx = filename.lastIndexOf(".");
  if (idx === -1) return ".png";
  return filename.slice(idx).toLowerCase();
}

function sanitizeFolder(folder: string): string {
  const clean = folder
    .replace(/[^a-zA-Z0-9-_/]/g, "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\/{2,}/g, "/");
  return clean;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const authorized = request.headers.get("Authorization") === `Bearer ${env.UPLOAD_SECRET}`;

    try {
      if (path === "/upload" && request.method === "POST") {
        if (!authorized) return json({ error: "Unauthorized" }, 401);
        return handleUpload(request, env);
      }

      if (path === "/delete" && request.method === "DELETE") {
        if (!authorized) return json({ error: "Unauthorized" }, 401);
        return handleDelete(request, env);
      }

      if (path === "/health") {
        return json({ ok: true });
      }

      return json({ error: "Not Found" }, 404);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      return json({ error: message }, 500);
    }
  },
} satisfies ExportedHandler<Env>;

async function handleUpload(request: Request, env: Env): Promise<Response> {
  const contentType = request.headers.get("Content-Type") || "";
  const filename = (request.headers.get("X-Filename") || "image.png").trim();
  const folder = sanitizeFolder(request.headers.get("X-Folder") || "");

  if (!/^image\//.test(contentType)) {
    return json({ error: "Only image content is allowed" }, 400);
  }

  const ext = normalizeExt(filename);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return json({ error: `Unsupported file type: ${ext}` }, 400);
  }

  const size = Number(request.headers.get("Content-Length") || 0);
  if (size > MAX_SIZE) {
    return json({ error: "File exceeds the 15MB limit" }, 413);
  }

  const bytes = await request.arrayBuffer();
  if (bytes.byteLength === 0) return json({ error: "Empty file" }, 400);
  if (bytes.byteLength > MAX_SIZE) return json({ error: "File exceeds the 15MB limit" }, 413);

  const key = [folder, `${Date.now()}-${crypto.randomUUID()}${ext}`].filter(Boolean).join("/");

  await env.ORDERSYNC_BUCKET.put(key, bytes, {
    httpMetadata: { contentType: CONTENT_TYPES[ext.slice(1)] || "application/octet-stream" },
  });

  const publicUrl = `${env.R2_PUBLIC_DOMAIN}/${key}`;

  return json({
    key,
    url: publicUrl,
    size: bytes.byteLength,
    contentType: CONTENT_TYPES[ext.slice(1)] || "application/octet-stream",
    uploadedAt: Date.now(),
  });
}

async function handleDelete(request: Request, env: Env): Promise<Response> {
  const key = new URL(request.url).searchParams.get("key") || "";
  if (!key) return json({ error: "Missing key" }, 400);

  if (key.includes("..") || key.startsWith("/")) {
    return json({ error: "Invalid key" }, 400);
  }

  await env.ORDERSYNC_BUCKET.delete(key);
  return json({ ok: true });
}
