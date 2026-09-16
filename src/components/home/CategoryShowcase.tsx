import Link from "next/link";

interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
}

interface Card {
  id: string;
  label: string;
  slug: string;
  tag: string;
  image: string | null;
}

// Anti-tarnish fallback aligned to real /shop/{slug} routes (no diamond/gemstone/bridal).
const FALLBACK: Card[] = [
  { id: "rings", label: "Rings", slug: "rings", tag: "Stackable & statement", image: null },
  { id: "earrings", label: "Earrings", slug: "earrings", tag: "Hoops, studs & drops", image: null },
  { id: "necklaces", label: "Necklaces", slug: "necklaces", tag: "Layered & pendant", image: null },
  { id: "bracelets", label: "Bracelets", slug: "bracelets", tag: "Cuffs & chains", image: null },
  { id: "gifts", label: "Gifts", slug: "gifts", tag: "Ready to gift", image: null },
  { id: "hampers", label: "Hampers", slug: "hampers", tag: "Curated sets", image: null },
  { id: "new", label: "New Arrivals", slug: "new-arrivals", tag: "Fresh everyday pieces", image: null },
  { id: "sale", label: "Seasonal Sale", slug: "sale", tag: "Little prices, big feeling", image: null },
];

// Soft editorial washes for image-less tiles (paper/blush/sage — Dori tokens).
const TILES = [
  "cat-tile-wash-1",
  "cat-tile-wash-2",
  "cat-tile-wash-3",
  "cat-tile-wash-4",
];

export default function CategoryShowcase({
  categories = [],
}: {
  categories?: DbCategory[];
}) {
  const cards: Card[] =
    categories.length > 0
      ? categories.slice(0, 8).map((c) => ({
          id: c.id,
          label: c.name,
          slug: c.slug,
          tag: c.description?.trim() || "Anti-tarnish · waterproof",
          image: c.image || null,
        }))
      : FALLBACK;

  return (
    <section className="shop-section editorial-container" aria-labelledby="categories-heading">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Shop by category</div>
          <h2 id="categories-heading">
            Find your <em>everyday piece.</em>
          </h2>
        </div>
        <Link href="/shop" className="text-link">
          View all products{" "}
          <svg className="w-4 h-4"><use href="#i-arrow" /></svg>
        </Link>
      </div>

      <div className="cat-grid">
        {cards.map((cat, i) => (
          <Link
            key={cat.id}
            href={`/shop/${cat.slug}`}
            className="cat-tile group"
          >
            <div className="cat-tile-media">
              {cat.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cat.image}
                  alt={cat.label}
                  loading={i < 4 ? "eager" : "lazy"}
                  className="cat-tile-img"
                />
              ) : (
                <div className={`cat-tile-fallback ${TILES[i % TILES.length]}`} aria-hidden="true">
                  <span className="cat-tile-word">Satva</span>
                </div>
              )}
              <span className="product-label">Anti-tarnish</span>
            </div>
            <div className="cat-tile-meta">
              <div className="cat-tile-topline">
                <h3 className="product-name">{cat.label}</h3>
                <span className="round-arrow cat-arrow" aria-hidden="true">
                  <svg className="w-[16px] h-[16px]"><use href="#i-arrow" /></svg>
                </span>
              </div>
              <p className="product-subtitle">{cat.tag}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="collection-footer">
        <p>Rings, earrings, necklaces & more — made for daily wear.</p>
      </div>
    </section>
  );
}
