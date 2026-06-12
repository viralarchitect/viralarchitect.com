import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Oswald } from "next/font/google";
import { ConsoleProvider } from "@/components/ConsoleProvider";
import "./globals.css";

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
  metadataBase: new URL("https://viralarchitect.com"),
  title: "VIRAL ARCHITECT :: SYSTEM CONSOLE",
  description:
    "Viral Architect — personal console of Nicholas King, Site Reliability Engineer. 15 years of enterprise Windows infrastructure, automation at scale, and modern SaaS (EquipQR). Active deployments, system specs, secure uplink.",
  openGraph: {
    title: "VIRAL ARCHITECT :: SYSTEM CONSOLE",
    description:
      "Site Reliability Engineer blending enterprise hybrid-cloud ops, toil-killing automation, and SaaS product development.",
    type: "website",
    images: [
      "https://placehold.co/1200x630/0b0c10/00FF41/png?text=VIRAL+ARCHITECT+::+SYSTEM+CONSOLE",
    ],
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
        <ConsoleProvider>{children}</ConsoleProvider>
      </body>
    </html>
  );
}
