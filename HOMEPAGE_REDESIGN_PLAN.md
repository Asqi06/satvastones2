# SatvaStones Homepage Redesign Plan

## Overview
Recreate the Joy Rush homepage UI/UX structure for SatvaStones anti-tarnish jewelry brand, adapting the playful/luxury aesthetic with new color palette and jewelry-appropriate content.

---

## 1. New Color Palette (Joy Rush Inspired for Jewelry)

### Primary Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Deep Wine | `#722F37` | Primary CTA, headers, dark accents |
| Rose Gold | `#E8B4B8` | Secondary accent, hover states, badges |
| Warm Cream | `#FDF6EC` | Page background, card backgrounds |
| Rich Charcoal | `#2D2D2D` | Primary text, headings |
| Soft Blush | `#FFF5F5` | Section alternates, subtle backgrounds |

### Secondary Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Antique Gold | `#C9A96E` | Premium accents, borders, icons |
| Deep Teal | `#2D6A4F` | Trust badges, success states |
| Soft Sage | `#E8F5E9` | Background accents, tags |
| Muted Rose | `#D4A5A5` | Subtle borders, dividers |

### CSS Variables to Add
```css
--brand-wine: #722F37;
--brand-rose-gold: #E8B4B8;
--brand-cream: #FDF6EC;
--brand-charcoal: #2D2D2D;
--brand-blush: #FFF5F5;
--brand-antique-gold: #C9A96E;
--brand-teal: #2D6A4F;
--brand-sage: #E8F5E9;
```

---

## 2. Homepage Sections (Top to Bottom)

### Section 1: Announcement Bar
- **Purpose**: Scrolling ticker with brand messages
- **Content**: "FREE SHIPPING ON ORDERS ABOVE ₹999" | "ANTI-TARNISH GUARANTEE" | "100% HANDCRAFTED" | "EASY RETURNS"
- **Style**: Wine background, cream text, infinite marquee scroll
- **Component**: Modify existing `BenefitBanner.tsx` or create new

### Section 2: Header (Already exists)
- Keep existing Header component
- Update color scheme to match new palette

### Section 3: Hero Section
- **Layout**: Full-width, 100vh height
- **Content**: 
  - Left: Bold headline "ELEGANCE THAT LASTS FOREVER"
  - Subtext: "Anti-tarnish jewelry crafted for the modern woman"
  - CTA: "SHOP NOW" button
- **Style**: Split layout - image left, text right (or overlay)
- **Animation**: Fade-in on load, subtle parallax

### Section 4: Brand Values Ticker
- **Purpose**: Scrolling benefits bar
- **Content**: "ANTI-TARNISH" | "NICKEL-FREE" | "WATER-RESISTANT" | "18K GOLD PLATED" | "HANDCRAFTED"
- **Style**: Cream background, wine text, continuous scroll

### Section 5: Category Showcase
- **Purpose**: Display jewelry categories
- **Layout**: 4-6 cards in grid (responsive)
- **Categories**: Earrings, Necklaces, Bracelets, Rings, Sets, Collections
- **Style**: Cards with hover effects, category image + name
- **Component**: Modify existing `CategoryShowcase.tsx`

### Section 6: Featured Products
- **Purpose**: Highlight best sellers/new arrivals
- **Layout**: 4 product cards in grid
- **Content**: Product image, name, price, "ADD TO CART" button
- **Style**: Cards with hover zoom, quick view overlay
- **Component**: Modify existing `FeaturedProducts.tsx`

### Section 7: Brand Story Section
- **Purpose**: Lifestyle imagery + brand message
- **Layout**: Full-width image with text overlay
- **Content**: "CRAFTED WITH LOVE, WORN WITH PRIDE" + brand story paragraph
- **Style**: Parallax background, fade-in text

### Section 8: Social Proof / Reviews
- **Purpose**: Customer testimonials
- **Layout**: 3 review cards in row
- **Content**: Star rating, review text, customer name
- **Style**: Cards with subtle shadow, gold accents
- **Component**: Modify existing `SocialProof.tsx`

### Section 9: Bundle & Save
- **Purpose**: Promotional offer section
- **Layout**: Split - left text, right product image
- **Content**: "BUNDLE & SAVE" headline, "Buy 2 Get 10% Off" offer, CTA
- **Style**: Blush background, wine accents

### Section 10: Newsletter
- **Purpose**: Email subscription
- **Layout**: Centered text + input field
- **Content**: "JOIN THE SATVASTONES FAMILY" + email input + subscribe button
- **Style**: Clean, minimal

### Section 11: Footer (Already exists)
- Keep existing Footer component
- Update color scheme to match new palette

---

## 3. Component Modifications

### New Components to Create
1. `AnnouncementBar.tsx` - Scrolling ticker
2. `HeroSection.tsx` - Main hero with CTA
3. `BrandStory.tsx` - Lifestyle section
4. `BundleSection.tsx` - Promotional offer
5. `Newsletter.tsx` - Email subscription

### Components to Modify
1. `CategoryShowcase.tsx` - Update colors, layout
2. `FeaturedProducts.tsx` - Update card design, colors
3. `SocialProof.tsx` - Update review card design
4. `BenefitBanner.tsx` - Repurpose as brand values ticker
5. `globals.css` - Add new color variables, update theme

---

## 4. Typography Updates

### Headlines
- **Font**: Cormorant Garamond (already loaded)
- **Weight**: 600-700
- **Style**: Italic for elegance
- **Size**: clamp(2.5rem, 5vw, 5rem)

### Body Text
- **Font**: Montserrat (already loaded)
- **Weight**: 400-500
- **Size**: 0.875rem - 1rem

### Labels/Buttons
- **Font**: Montserrat
- **Weight**: 600
- **Transform**: UPPERCASE
- **Letter-spacing**: 0.1em

---

## 5. Animation Patterns (CSS Only)

### Page Load
- Hero content: `animate-fade-in` (already exists)
- Staggered section reveal with intersection observer

### Hover Effects
- Product cards: `transition-all duration-300 hover:scale-105`
- Buttons: `transition-colors duration-200`
- Images: `transition-transform duration-500 hover:scale-110`

### Scroll Animations
- Use `IntersectionObserver` for reveal-on-scroll
- Fade in from bottom: `translate-y-8 opacity-0` → `translate-y-0 opacity-100`

### Marquee
- Reuse existing `animate-marquee` from globals.css

---

## 6. Responsive Design

### Mobile (< 768px)
- Single column layouts
- Stacked product cards
- Simplified navigation
- Touch-friendly buttons

### Tablet (768px - 1024px)
- 2-column grids
- Side-by-side layouts where appropriate

### Desktop (> 1024px)
- Full multi-column layouts
- Hover effects enabled
- Maximum content width: 1400px

---

## 7. Files to Modify/Create

### New Files
```
src/components/home/AnnouncementBar.tsx
src/components/home/HeroSection.tsx
src/components/home/BrandStory.tsx
src/components/home/BundleSection.tsx
src/components/home/Newsletter.tsx
```

### Modified Files
```
src/app/globals.css (add new color variables)
src/app/page.tsx (recompose sections)
src/components/home/CategoryShowcase.tsx (update design)
src/components/home/FeaturedProducts.tsx (update card design)
src/components/home/SocialProof.tsx (update review design)
src/components/home/BenefitBanner.tsx (repurpose as brand ticker)
```

---

## 8. Content Strategy

### Headlines
- Hero: "ELEGANCE THAT LASTS FOREVER"
- Categories: "SHOP BY CATEGORY"
- Featured: "BESTSELLERS"
- Brand Story: "CRAFTED WITH LOVE"
- Reviews: "WHAT OUR CUSTOMERS SAY"
- Bundle: "BUNDLE & SAVE"

### Subtext
- Anti-tarnish guarantee messaging
- Quality craftsmanship
- Affordable luxury
- Easy returns/exchanges

---

## 9. Implementation Order

1. **Phase 1**: Update globals.css with new color palette
2. **Phase 2**: Create new components (AnnouncementBar, HeroSection, BrandStory, BundleSection, Newsletter)
3. **Phase 3**: Modify existing components (CategoryShowcase, FeaturedProducts, SocialProof)
4. **Phase 4**: Recompose page.tsx with new section order
5. **Phase 5**: Add animations and responsive design
6. **Phase 6**: Test and refine

---

## 10. Success Criteria

- [x] All 11 sections implemented
- [x] New color palette applied consistently
- [x] Responsive on mobile/tablet/desktop
- [x] Smooth CSS transitions
- [x] Existing functionality preserved (cart, wishlist, navigation)
- [x] Build passes (`npm run build`)
- [x] Type checking clean (`npx tsc --noEmit`)

---

## Notes

- **Placeholder Graphics**: Use solid color blocks or gradient placeholders for images
- **No framer-motion**: Stick to CSS transitions as per user preference
- **Reuse Existing**: Maximize reuse of existing component logic, only update styling
- **Preserve SEO**: Keep all existing JSON-LD, metadata, and semantic HTML
