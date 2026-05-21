import type { MetadataRoute } from "next";

const BASE_URL = process.env.AUTH_URL ?? "https://multick.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing"],
        disallow: ["/api/", "/admin/", "/settings/", "/projects/", "/reports/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
