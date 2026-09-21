export const SITE_URL = "https://www.viralarchitect.com";
export const SITE_TITLE = "Nicholas King | Site Reliability Engineer";
export const SITE_DESCRIPTION =
  "Site Reliability Engineer with 15+ years in production infrastructure, incident response, and automation. Enterprise Windows, hybrid cloud, and SaaS software engineering.";

// Only the explicitly identified production deployment is indexable.
// Local builds, preview branches, and custom non-production environments stay excluded.
export function indexingPolicy(deploymentEnvironment: string | undefined = process.env.VERCEL_ENV) {
  const production = deploymentEnvironment === "production";
  return { index: production, follow: production };
}
