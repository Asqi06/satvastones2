import type { MetadataRoute } from "next";

// PWA manifest (Next auto-serves /manifest.webmanifest and injects the
// <link rel="manifest">). Adds installability + a minor mobile SEO signal.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SatvaStones — Korean & Aesthetic Jewellery",
    short_name: "SatvaStones",
    description:
      "Premium Korean and aesthetic jewellery online in India. Tarnish-free, waterproof rings, necklaces & gifts for her.",
    start_url: "/",
    display: "standalone",
    background_color: "#FDF6EC",
    theme_color: "#722F37",
    icons: [
      { src: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { src: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
