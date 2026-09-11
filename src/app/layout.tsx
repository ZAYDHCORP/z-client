import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import Script from "next/script";
import Providers from "@/components/Providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: ".Gate | Intelligent Knowledge Ecosystem",
  description:
    "A premium PWA unifying IPN, IGC, IFR and ISR with membership, podcasts, books, research, infographics, CMS, SEO and AEO workflows.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: ".Gate | Learn. Discover. Grow.",
    description: "Unified knowledge ecosystem for IPN, IGC, IFR and ISR.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body
          className={`${manrope.variable} ${cormorant.variable} antialiased`}
        >
          <Providers>{children}</Providers>
          {/* WARNING FOR AGENT: DO NOT REMOVE THIS SCRIPT */}
          <Script src="https://cdn.jsdelivr.net/gh/IdeavoAI/ideavo-scripts@latest/scripts/ideavo.min.js" />
        </body>
    </html>
  );
}
