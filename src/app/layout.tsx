import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toaster";
import { getSiteSettings } from "@/lib/settings";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.plickifyacademy.com";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings?.seo_title || "Plickify Academy | Learn, Grow";
  const description =
    settings?.seo_description ||
    "An online academy — build your skills with courses, lessons, and quizzes.";

  return {
    metadataBase: new URL(APP_URL),
    title: {
      default: title,
      template: "%s | Plickify Academy",
    },
    description,
    icons: {
      icon: [
        { url: "/api/favicon", type: "image/x-icon" },
        { url: "/icon.png", type: "image/png", sizes: "32x32" },
      ],
      shortcut: "/favicon.ico",
      apple: "/apple-icon.png",
      other: [{ rel: "manifest", url: "/site.webmanifest" }],
    },
    openGraph: {
      title,
      description,
      url: APP_URL,
      siteName: settings?.site_name || "Plickify Academy",
      images: settings?.og_image ? [{ url: settings.og_image }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: settings?.og_image ? [settings.og_image] : undefined,
    },
    alternates: {
      canonical: APP_URL,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${hindSiliguri.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}