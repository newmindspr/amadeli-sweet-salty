const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'none'",
  "frame-src 'none'",
  "img-src 'self'",
  "style-src 'self'",
  "script-src 'self' 'sha256-VDUPfyHyNvF+WHx3PxoKy11axgPqd92ABZpTAj6ZWNs='",
  "connect-src 'self'",
  "font-src 'self'",
  "media-src 'none'",
  "worker-src 'none'",
  "manifest-src 'self'",
].join("; ");

const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=86400",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "X-XSS-Protection": "0",
};

const isLocalHostname = (hostname) =>
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "::1" ||
  hostname === "[::1]";

const withSecurityHeaders = (response, pathname) => {
  const headers = new Headers(response.headers);

  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }

  if (headers.get("Content-Type")?.includes("text/html")) {
    headers.set("Content-Security-Policy", CONTENT_SECURITY_POLICY);
  }

  if (pathname === "/" || pathname === "/index.html") {
    headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const forwardedProtocol = request.headers.get("X-Forwarded-Proto");
    const isHttpRequest =
      forwardedProtocol === "http" ||
      (forwardedProtocol === null && url.protocol === "http:" && !isLocalHostname(url.hostname));

    if (isHttpRequest) {
      url.protocol = "https:";
      url.port = "";

      return new Response(null, {
        status: 307,
        headers: {
          "Cache-Control": "no-store",
          Location: url.toString(),
        },
      });
    }

    const assetResponse = await env.ASSETS.fetch(request);
    return withSecurityHeaders(assetResponse, url.pathname);
  },
};
