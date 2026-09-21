import type { MetadataRoute } from "next";
import { SITE_URL, indexingPolicy } from "@/lib/seo";
export default function sitemap(): MetadataRoute.Sitemap {
  return indexingPolicy().index ? [{ url: `${SITE_URL}/` }] : [];
}
