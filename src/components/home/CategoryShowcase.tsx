import Link from "next/link";

const categories = [
  {
    name: "Korean",
    slug: "korean",
    description: "Minimalist Seoul aesthetics",
    image: "https://images.unsplash.com/photo-1611085583191-a3b1a1a27d21?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Western",
    slug: "western",
    description: "Classic Parisian elegance",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Traditional",
    slug: "traditional",
    description: "Timeless heritage pieces",
    image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Fusion",
    slug: "fusion",
    description: "Modern cross-cultural blend",
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=800&auto=format&fit=crop",
  },
];

export default function CategoryShowcase() {
  return (
    <section className="py-24 lg:py-32 bg-white border-y border-border">
      <div className="container-wide">
        <div className="text-center mb-20">
          <p className="text-muted text-[10px] tracking-[0.5em] uppercase mb-4 font-bold">
            Taxonomy
          </p>
          <h2 className="text-4xl lg:text-5xl font-serif text-foreground">
            Curated Styles
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0.5 bg-border border border-border">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?style=${cat.slug.toUpperCase()}`}
              className="group relative h-[500px] bg-white overflow-hidden transition-all duration-700"
            >
              <div className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-1000">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-40 group-hover:opacity-100"
                />
              </div>
              
              <div className="relative h-full p-12 flex flex-col justify-end z-10">
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-2xl font-serif text-foreground mb-3">
                    {cat.name}
                  </h3>
                  <p className="text-muted text-sm font-light mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {cat.description}
                  </p>
                  <div className="flex items-center gap-4 text-foreground text-[10px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                    <span>Discover</span>
                    <span className="w-8 h-[1px] bg-foreground"></span>
                  </div>
                </div>
              </div>
              
              {/* Corner accent */}
              <div className="absolute top-8 right-8 w-px h-8 bg-foreground/10 group-hover:bg-foreground/50 transition-all duration-500"></div>
              <div className="absolute top-8 right-8 h-px w-8 bg-foreground/10 group-hover:bg-foreground/50 transition-all duration-500"></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
