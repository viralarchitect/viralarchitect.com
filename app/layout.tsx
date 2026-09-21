import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Oswald } from "next/font/google";
import { ConsoleProvider } from "@/components/ConsoleProvider";
import "./globals.css";
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION, indexingPolicy } from "@/lib/seo";
import { PROFILE, SOCIAL_LINKS } from "@/content/profile";

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const fontDisplay = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL + "/" },
  robots: indexingPolicy(),
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL + "/",
    siteName: "Viral Architect · Nicholas King",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Nicholas King — Site Reliability Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0c10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontMono.variable} ${fontDisplay.variable}`}>
      <body data-grid="on" data-scan="on">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: PROFILE.name,
              url: SITE_URL,
              jobTitle: "Site Reliability Engineer",
              description: SITE_DESCRIPTION,
              image: SITE_URL + "/Nicholas-King-Photo.jpg",
              sameAs: Object.values(SOCIAL_LINKS),
            }).replace(/</g, "\\u003c"),
          }}
        />
        <ConsoleProvider>{children}</ConsoleProvider>
      </body>
    </html>
  );
}
