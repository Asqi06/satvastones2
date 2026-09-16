import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/aniadmin",
          "/aniadmin/",
          "/api/",
          "/auth/",
          "/cart",
          "/cart/",
          "/checkout",
          "/checkout/",
          "/account",
          "/account/",
          "/order-confirmation/",
          "/wishlist",
          "/wishlist/",
          "/*?*category=",
          "/*?*sub=",
          "/*?*search=",
          "/*?*sort=",
          "/*?*page=",
          "/*?*minPrice=",
          "/*?*maxPrice=",
          "/*?*style=",
          "/*?*material=",
          "/*?*utm_",
          "/*?*gclid=",
          "/*?*fbclid=",
        ],
      },
    ],
    sitemap: "https://satvastones.in/sitemap.xml",
  };
}
