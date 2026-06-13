import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/account/", "/cart", "/checkout", "/wishlist", "/order-confirmation/"],
      },
    ],
    sitemap: "https://satvastones.in/sitemap.xml",
  };
}
