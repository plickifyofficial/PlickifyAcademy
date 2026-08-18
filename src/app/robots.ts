import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://www.plickifyacademy.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/admin",
          "/login",
          "/signup",
          "/checkout",
          "/certificates",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}