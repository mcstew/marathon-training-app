import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const GA_MEASUREMENT_ID = "G-W2VBGR482T";

export const metadata: Metadata = {
  metadataBase: new URL("https://marathontrainingplan.com"),
  title: {
    default: "Marathon Training Plan - Free 18-Week Training Schedules",
    template: "%s | Marathon Training Plan",
  },
  description:
    "Free personalized marathon training plans. Get an 18-week schedule tailored to your race day with proven Hal Higdon methodology. Track workouts, sync across devices, works offline.",
  keywords: [
    "marathon training plan",
    "18 week marathon plan",
    "marathon training schedule",
    "beginner marathon training",
    "marathon plan calendar",
  ],
  alternates: {
    canonical: "https://marathontrainingplan.com",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Marathon Training Plan - Free 18-Week Training Schedules",
    description:
      "Free personalized marathon training plans based on proven methodology. Get an 18-week schedule tailored to your race day. Track workouts, sync across devices.",
    url: "https://marathontrainingplan.com",
    siteName: "Marathon Training Plan",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 800,
        alt: "Marathon Training Plan - free 18-week training schedules",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marathon Training Plan - Free 18-Week Training Schedules",
    description:
      "Free personalized marathon training plans based on proven methodology. Get an 18-week schedule tailored to your race day.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
