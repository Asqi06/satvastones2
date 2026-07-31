import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/cart",
          "/cart/(.*)",
          "/checkout",
          "/checkout/(.*)",
          "/account",
          "/account/(.*)",
          "/api/(.*)",
          "/admin/(.*)",
          "/auth/(.*)",
          "/order-confirmation/(.*)",
          "/wishlist",
          "/wishlist/(.*)",
        ],
      },
    ],
    sitemap: "https://satvastones.in/sitemap.xml",
  };
}
