import { ImageResponse } from "next/og";

export const alt = "SatvaStones — Korean & Aesthetic Jewellery India";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Site-wide default OG/Twitter image (Next file convention). Product pages
// override with their own image via generateMetadata; everything else inherits
// this branded card. Replaces the previous broken static og-image.jpg (404 +
// wrong www host vs the non-www canonical — see FIXES.MD).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F6F3EC",
          color: "#505A3D",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 104, fontWeight: 700, letterSpacing: -2 }}>
          SatvaStones
        </div>
        <div style={{ fontSize: 42, color: "#292A23", marginTop: 12 }}>
          Korean &amp; Aesthetic Jewellery · India
        </div>
        <div style={{ fontSize: 28, color: "#77786E", marginTop: 28 }}>
          Tarnish-free · Waterproof · Everyday Luxury
        </div>
      </div>
    ),
    { ...size }
  );
}
