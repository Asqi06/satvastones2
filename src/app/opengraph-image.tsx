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
          backgroundColor: "#FFF6E4",
          color: "#211A0C",
          fontFamily: "serif",
          border: "24px solid #211A0C",
        }}
      >
        <div style={{ fontSize: 104, fontWeight: 900, letterSpacing: -2 }}>
          satvastones
        </div>
        <div style={{ fontSize: 42, color: "#CE3B17", marginTop: 12, fontStyle: "italic" }}>
          Korean &amp; Aesthetic Jewellery · India
        </div>
        <div style={{ fontSize: 28, color: "#6B5F45", marginTop: 28 }}>
          Anti-tarnish · Waterproof · Worn daily
        </div>
      </div>
    ),
    { ...size }
  );
}
