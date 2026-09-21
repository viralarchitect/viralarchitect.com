import type { MetadataRoute } from "next";
import { SITE_URL, indexingPolicy } from "@/lib/seo";
export default function robots(): MetadataRoute.Robots {
  return indexingPolicy().index
    ? {
        rules: { userAgent: "*", allow: "/", disallow: "/api/" },
        sitemap: `${SITE_URL}/sitemap.xml`,
      }
    : { rules: { userAgent: "*", disallow: "/" } };
}
