import type { Metadata } from "next";
import { DM_Serif_Display, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const BASE_URL = "https://glowguideseoul.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Seoul Glow Guide",
    template: "%s | Seoul Glow Guide",
  },
  description:
    "Plan your Seoul clinic visit with confidence. Find foreigner-ready clinics, prepare consultation questions, and navigate aftercare — before you fly.",
  keywords: [
    "Seoul clinic guide",
    "K-beauty medical tourism",
    "Korea plastic surgery foreigners",
    "Seoul skin clinic English",
    "medical travel Korea",
    "Gangnam dermatology foreigners",
  ],
  authors: [{ name: "Seoul Glow Guide" }],
  creator: "Seoul Glow Guide",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Seoul Glow Guide",
    title: "Seoul Glow Guide — K-beauty clinic trips, guided",
    description:
      "Find foreigner-ready clinics in Seoul, get pre-visit advice, and prepare for every step of your clinic trip.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Seoul Glow Guide" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Seoul Glow Guide — K-beauty clinic trips, guided",
    description:
      "Find foreigner-ready clinics in Seoul, get pre-visit advice, and prepare for every step of your clinic trip.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/seoul-glow-guide-mark.svg",
    apple: "/seoul-glow-guide-mark.svg",
  },
};

const GA_ID = "G-3P17BWMG7Q";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${jakarta.variable}`}>
      <body className="min-h-screen antialiased">
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}</Script>
      </body>
    </html>
  );
}
