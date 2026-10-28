export const SITE_URL = "https://www.viralarchitect.com";
export const SITE_TITLE = "Nicholas King | Systems & Reliability Engineer";
export const SITE_DESCRIPTION =
  "Systems engineer with 15+ years of production operations, incident response, and automation across enterprise Windows, hybrid cloud, and SaaS.";

// Only the explicitly identified production deployment is indexable.
// Local builds, preview branches, and custom non-production environments stay excluded.
export function indexingPolicy(deploymentEnvironment: string | undefined = process.env.VERCEL_ENV) {
  const production = deploymentEnvironment === "production";
  return { index: production, follow: production };
}
