"use client";

import type { ReactNode } from "react";

/**
 * App Router route-enter transition. template.tsx remounts on every navigation,
 * so the CSS fade replays for each new route. Opacity-only by design: a
 * transform/filter here would create a containing block and break
 * `position: sticky`/`fixed` inside pages (product gallery, shop filters).
 *
 * Implemented as CSS (not motion/react) on purpose: content must stay visible
 * even if client JS fails or hydrates slowly — a JS-driven initial opacity:0
 * left the whole page blank (header/footer only) whenever the animation never
 * ran. The global prefers-reduced-motion rule in globals.css disables this
 * animation for users who opt out.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="animate-route-enter">{children}</div>;
}
