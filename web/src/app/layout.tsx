import type { Metadata } from "next";
import "./globals.css";

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
    icon: "/icon.svg",
  },
  openGraph: {
    title: "Marathon Training Plan - Free 18-Week Training Schedules",
    description:
      "Free personalized marathon training plans based on proven methodology. Get an 18-week schedule tailored to your race day. Track workouts, sync across devices.",
    url: "https://marathontrainingplan.com",
    siteName: "Marathon Training Plan",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
