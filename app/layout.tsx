import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. IMPROVED METADATA FOR SEO
export const metadata: Metadata = {
  // Uses a template so pages can have "County Name | Civic Observer"
  title: {
    template: "%s | Civic Observer 2027",
    default: "Civic Observer 2027 - Real-Time Kenyan Election Data",
  },
  description: "Participate in the 2027 Civic Observer project. A neutral, real-time data collection platform for Kenyan civic engagement and transparency.",
  keywords: ["Kenya Elections", "2027", "Civic Observer", "Polling Data", "Nairobi", "Politics", "Voting"],
  authors: [{ name: "StudyLite Kenya" }],
  creator: "StudyLite Kenya",
  publisher: "StudyLite Kenya",
  
  // 2. SOCIAL SHARING (Open Graph) - Makes links look good on WhatsApp/Facebook
  openGraph: {
    title: "Civic Observer 2027 - Kenya",
    description: "Real-time, neutral civic data collection for the 2027 season.",
    url: "https://your-domain.com", // Replace with your actual domain
    siteName: "Civic Observer 2027",
    locale: "en_KE",
    type: "website",
  },

  // 3. TWITTER CARDS
  twitter: {
    card: "summary_large_image",
    title: "Civic Observer 2027",
    description: "Real-time civic data collection for Kenya.",
    creator: "@Ethandewatcher", // From your footer info
  },

  // 4. INDEXING CONTROL
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// 5. VIEWPORT SETTINGS (For mobile responsiveness)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000", // Matches your black header
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}