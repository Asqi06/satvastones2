import type { Product } from '../types/ecommerce';

export function formatPrice(paise: number): string {
  const rupees = Math.round(paise / 100);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(rupees);
}

export const PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Aura Herringbone Snake Chain',
    slug: 'aura-herringbone-snake-chain',
    sku: 'SAT-NK-001',
    category: 'necklaces',
    collection: 'everyday-luxury',
    headline: 'Silky smooth liquid gold finish that lays flush against your collarbone',
    description: 'The Aura Snake Chain embodies timeless Italian craftsmanship reimagined for Indian tropical climates. Crafted with hypoallergenic 316L medical-grade stainless steel and bonded with a resilient 18K gold PVD layer that will never fade, tarnish, or turn green.',
    material: '316L Stainless Steel + 18K Yellow Gold PVD',
    finish: 'High Polish Liquid Gleam',
    dimensions: '40cm length + 5cm extender chain (3mm width)',
    weightGrams: 8.4,
    careInstructions: [
      'Safe for regular showers, gym sessions, and humid weather',
      'Rinse with fresh water after pool swims or beach visits',
      'Wipe dry with the included microfiber pouch'
    ],
    warranty: '6 Months Anti-Tarnish Assurance',
    pricePaise: 169900,
    compareAtPricePaise: 249900,
    rating: 4.9,
    reviewCount: 128,
    isBestseller: true,
    isNewArrival: false,
    inStock: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
        alt: 'Aura Herringbone Snake Chain in warm 18K gold on minimalist background',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1000&q=80',
        alt: 'Aura Herringbone Chain macro clasp and link details'
      }
    ]
  },
  {
    id: 'prod-002',
    name: 'Elysian Croissant Dome Ring',
    slug: 'elysian-croissant-dome-ring',
    sku: 'SAT-RG-002',
    category: 'rings',
    collection: 'sculpted-forms',
    headline: 'French vintage inspired ribbed croissant silhouette with organic curves',
    description: 'Fluted contours that catch light from every angle. The Elysian Ring delivers substantial presence with a hollowed comfort-fit interior so you can wear it continuously without finger fatigue.',
    material: '316L Surgical Stainless Steel + 18K Gold PVD',
    finish: 'Micro-ribbed satin and mirror contrast',
    dimensions: 'Band width 7mm tapered to 4mm at base',
    weightGrams: 5.2,
    careInstructions: [
      'Withstands frequent handwashing and hand sanitizer exposure',
      'Store in individual SatvaStones pouch when not worn'
    ],
    warranty: '6 Months Anti-Tarnish Assurance',
    pricePaise: 129900,
    compareAtPricePaise: 189900,
    rating: 4.8,
    reviewCount: 94,
    isBestseller: true,
    isNewArrival: false,
    inStock: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80',
        alt: 'Elysian Croissant Dome Ring in golden sunlight',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1000&q=80',
        alt: 'Elysian Croissant Ring side view'
      }
    ]
  },
  {
    id: 'prod-003',
    name: 'Serene Molten Pearl Pendant',
    slug: 'serene-molten-pearl-pendant',
    sku: 'SAT-NK-003',
    category: 'necklaces',
    collection: 'coastal-memories',
    headline: 'Organic freeform Baroque freshwater pearl cradled in molten golden bezel',
    description: 'Each natural freshwater pearl is distinct. Set inside an intentionally irregular organic rim, suspended from a delicate rope chain that glimmers subtly.',
    material: 'Genuine Cultured Freshwater Pearl + 316L Stainless Steel 18K PVD',
    finish: 'Organic Molten Texture',
    dimensions: '45cm + 5cm extender; Pearl ~10-12mm',
    weightGrams: 6.8,
    careInstructions: [
      'Avoid spraying perfume directly onto the natural pearl',
      'Gently wipe with soft cloth after daily wear'
    ],
    warranty: '6 Months Anti-Tarnish Assurance on Metal Chain & Bezel',
    pricePaise: 189900,
    compareAtPricePaise: 279900,
    rating: 5.0,
    reviewCount: 76,
    isBestseller: true,
    isNewArrival: true,
    inStock: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80',
        alt: 'Serene Molten Pearl Pendant hanging elegantly',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
        alt: 'Close-up of pearl surface and molten gold frame'
      }
    ]
  },
  {
    id: 'prod-004',
    name: 'Solace Chunky Link Chain Bracelet',
    slug: 'solace-chunky-link-chain-bracelet',
    sku: 'SAT-BR-004',
    category: 'bracelets',
    collection: 'modern-architect',
    headline: 'Substantial interlocking oval links with secure custom lobster lock',
    description: 'A confident everyday staple. Balances clean lines with bold proportions. Heavy enough to feel luxurious, yet engineered with hollow-core steel links to remain comfortable all day.',
    material: '316L Surgical Stainless Steel + 18K Heavy Gold PVD',
    finish: 'Mirror Polished',
    dimensions: '17cm length + 3cm extender',
    weightGrams: 11.5,
    careInstructions: [
      'Sweatproof, waterproof, gym-proof',
      'No green discoloration on wrists'
    ],
    warranty: '6 Months Anti-Tarnish Assurance',
    pricePaise: 149900,
    compareAtPricePaise: 219900,
    rating: 4.9,
    reviewCount: 112,
    isBestseller: true,
    isNewArrival: false,
    inStock: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1000&q=80',
        alt: 'Solace Chunky Link Chain Bracelet lying on warm stone',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80',
        alt: 'Solace Bracelet clasp detail'
      }
    ]
  },
  {
    id: 'prod-005',
    name: 'Chloe Sculptural Ribbed Huggies',
    slug: 'chloe-sculptural-ribbed-huggies',
    sku: 'SAT-ER-005',
    category: 'earrings',
    collection: 'sculpted-forms',
    headline: 'Snug-fitting chunky huggie hoops with satisfying click-lock closure',
    description: 'Designed to sleep, shower, and live in. The Chloe Huggies feature an ergonomic curved post that slides effortlessly through pierced lobes and snaps shut securely.',
    material: '316L Hypoallergenic Stainless Steel + 18K Gold PVD',
    finish: 'Fluted Ribbon Polish',
    dimensions: '14mm outer diameter, 6mm width',
    weightGrams: 4.1,
    careInstructions: [
      'Hypoallergenic post prevents irritation in sensitive ears',
      'Never discolors in shower or rain'
    ],
    warranty: '6 Months Anti-Tarnish Assurance',
    pricePaise: 119900,
    compareAtPricePaise: 169900,
    rating: 4.9,
    reviewCount: 154,
    isBestseller: true,
    isNewArrival: false,
    inStock: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1000&q=80',
        alt: 'Chloe Sculptural Ribbed Huggie Earrings pair',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80',
        alt: 'Chloe Huggies hinge mechanism macro'
      }
    ]
  },
  {
    id: 'prod-006',
    name: 'Vesta Twisted Cable Kada Bangle',
    slug: 'vesta-twisted-cable-kada-bangle',
    sku: 'SAT-BG-006',
    category: 'bangles',
    collection: 'heritage-reimagined',
    headline: 'Architectural twisted rope motif with rounded finial ends',
    description: 'A contemporary Indian staple. Easily slip on and adjust to your wrist size. Strong shape retention that will not deform with regular wear.',
    material: '316L High Tensile Stainless Steel + 18K Gold PVD',
    finish: 'Braided Cable High Gloss',
    dimensions: '60mm internal diameter (flexible fit)',
    weightGrams: 14.2,
    careInstructions: [
      'Adjust gently by pressing inwards or outwards',
      'Resistant to sweat, perfumes, and lotions'
    ],
    warranty: '6 Months Anti-Tarnish Assurance',
    pricePaise: 179900,
    compareAtPricePaise: 259900,
    rating: 4.8,
    reviewCount: 63,
    isBestseller: false,
    isNewArrival: true,
    inStock: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1000&q=80',
        alt: 'Vesta Twisted Cable Kada Bangle styled on cream marble',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1708222170725-a7bf4149acea?auto=format&fit=crop&w=1000&q=80',
        alt: 'Vesta Kada finial end detail'
      }
    ]
  },
  {
    id: 'prod-007',
    name: 'Mira Dual Bezel Solitaire Ring',
    slug: 'mira-dual-bezel-solitaire-ring',
    sku: 'SAT-RG-007',
    category: 'rings',
    collection: 'everyday-luxury',
    headline: 'Clean 5A Cubic Zirconia stone held in a low-profile protective bezel',
    description: 'Engineered for active lifestyles. The flush bezel setting ensures the brilliant stone never catches on knit sweaters, hair, or pockets.',
    material: '316L Stainless Steel + 5A Cubic Zirconia + 18K Gold PVD',
    finish: 'High Polish Precision Cut',
    dimensions: 'Band 2mm, Bezel 6mm',
    weightGrams: 3.2,
    careInstructions: [
      'Clean periodically with warm soapy water and soft brush to restore stone sparkle',
      'Waterproof and anti-tarnish'
    ],
    warranty: '6 Months Anti-Tarnish Assurance',
    pricePaise: 139900,
    compareAtPricePaise: 199900,
    rating: 4.9,
    reviewCount: 88,
    isBestseller: false,
    isNewArrival: true,
    inStock: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80',
        alt: 'Mira Dual Bezel Solitaire Ring on soft linen',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80',
        alt: 'Mira Ring facet reflection'
      }
    ]
  },
  {
    id: 'prod-008',
    name: 'The Golden Hour Gifting Capsule',
    slug: 'the-golden-hour-gifting-capsule',
    sku: 'SAT-GS-008',
    category: 'gift-sets',
    collection: 'curated-sets',
    headline: 'Our bestselling Aura Snake Chain paired with the Chloe Huggies in a luxury keepsake box',
    description: 'The ultimate signature pairing. Ships in a velvet-lined chocolate drawer box with satin pull-tab, anti-tarnish pouch, authenticity card, and custom gifting message.',
    material: '316L Stainless Steel with 18K Gold PVD',
    finish: 'Mirror Polish Ensembles',
    dimensions: 'Necklace 40+5cm, Earrings 14mm',
    weightGrams: 12.5,
    careInstructions: [
      'Both pieces engineered for everyday wear without tarnishing',
      'Includes 2 individual storage pouches'
    ],
    warranty: '6 Months Anti-Tarnish Assurance on both pieces',
    pricePaise: 249900,
    compareAtPricePaise: 389900,
    rating: 5.0,
    reviewCount: 42,
    isBestseller: true,
    isNewArrival: true,
    inStock: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80',
        alt: 'The Golden Hour Gifting Capsule in luxury presentation box',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
        alt: 'Contents of the gifting capsule displayed'
      }
    ]
  },
  {
    id: 'prod-009',
    name: 'The Mystery Jewellery Jar (Anti-Tarnish Capsule)',
    slug: 'the-mystery-jewellery-jar',
    sku: 'SAT-MJ-009',
    category: 'mystery-jewellery-jar',
    collection: 'viral-curations',
    headline: 'Viral mystery jar containing 3 surprise 18K gold PVD waterproof jewellery essentials (Worth ₹4,999+)',
    description: 'Unbox pure magic with the SatvaStones Mystery Jewellery Jar. Hand-assembled at our Vapi store location in Gujarat, each sealed glass keepsake jar contains 3 surprise fine anti tarnish jewellery pieces—featuring our bestselling waterproof herringbone chains, comfort-fit dome rings, sculptural huggies, or delicate link bracelets. Engineered with medical-grade 316L stainless steel and 18K vacuum gold PVD, guaranteed 100% waterproof, sweatproof, and zero green skin. Perfect affordable luxury gift for women and everyday styling.',
    material: '316L Surgical Stainless Steel + 18K Vacuum Gold PVD',
    finish: 'Mirror & Satin Gold PVD Finishes',
    dimensions: 'Keepsake Jar with 3 Individually Pouched Pieces',
    weightGrams: 28.5,
    careInstructions: [
      'All 3 jewellery pieces are 100% waterproof and shower-safe',
      'Wipe dry with the included microfiber polishing cloth',
      'Store pieces in their dedicated anti-tarnish velvet pouches'
    ],
    warranty: '6 Months Anti-Tarnish Assurance on All 3 Pieces',
    pricePaise: 199900,
    compareAtPricePaise: 499900,
    rating: 4.95,
    reviewCount: 84,
    isBestseller: true,
    isNewArrival: true,
    inStock: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80',
        alt: 'The Mystery Jewellery Jar by SatvaStones with surprise anti-tarnish waterproof pieces',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80',
        alt: 'Mystery Jewellery Jar unpackaged velvet pouches and 18K gold PVD jewellery'
      }
    ]
  },
  {
    id: 'prod-010',
    name: 'Royal Heirloom Anti-Tarnish Jewellery Set',
    slug: 'royal-heirloom-anti-tarnish-jewellery-set',
    sku: 'SAT-SET-010',
    category: 'jewellery-set',
    collection: 'curated-sets',
    headline: 'Harmonious 3-piece anti-tarnish necklace, bracelet, and huggie set designed for saree styling and daily wear',
    description: 'Elevate your everyday wardrobe and traditional Indian sarees with the Royal Heirloom Anti Tarnish Jewellery Set. This coordinated trio features a radiant fluid herringbone chain, an interlocking link bracelet, and comfort-fit fluted huggie earrings. Made with hypoallergenic 316L surgical stainless steel and double-bonded 18K gold PVD, this waterproof jewellery set remains lustrous through humid Indian weather, monsoons, and daily wear without ever leaving green residue on your skin.',
    material: '316L Surgical Stainless Steel + 18K Vacuum Gold PVD',
    finish: 'Liquid Gold Polish',
    dimensions: 'Necklace 40+5cm, Bracelet 17+3cm, Huggies 14mm',
    weightGrams: 24.0,
    careInstructions: [
      'Ideal companion for cotton, organza, and festive silk sarees',
      'Safe for daily showers, perfumes, and humid commutes',
      'Clean periodically with warm soapy water to restore brilliance'
    ],
    warranty: '6 Months Full Anti-Tarnish Guarantee',
    pricePaise: 329900,
    compareAtPricePaise: 549900,
    rating: 5.0,
    reviewCount: 67,
    isBestseller: true,
    isNewArrival: true,
    inStock: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
        alt: 'Royal Heirloom Anti-Tarnish Jewellery Set laid out on fine silk saree',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1620656798579-1984d9e87df7?auto=format&fit=crop&w=1000&q=80',
        alt: 'Matching necklace and bracelet details of anti-tarnish jewellery set'
      }
    ]
  }
];

export const REVIEWS = [
  {
    id: 'rev-1',
    authorName: 'Ananya Deshmukh',
    rating: 5,
    verifiedPurchase: true,
    productName: 'Aura Herringbone Snake Chain',
    content: 'I have worn this necklace continuously for 4 months—including daily hot showers, Mumbai humidity, and workouts. Absolutely zero discoloration and no greenish tint on my collarbone. Truly legitimate anti-tarnish quality.',
    date: '2 weeks ago'
  },
  {
    id: 'rev-2',
    authorName: 'Pooja Iyer',
    rating: 5,
    verifiedPurchase: true,
    productName: 'Chloe Sculptural Ribbed Huggies',
    content: 'My ears are hypersensitive to artificial alloys and usually flare up within hours. These huggies have caused zero reaction. The click closure is super secure and they look just like solid gold.',
    date: '1 month ago'
  },
  {
    id: 'rev-3',
    authorName: 'Rhea Mehra',
    rating: 5,
    verifiedPurchase: true,
    productName: 'Solace Chunky Link Chain Bracelet',
    content: 'The packaging itself felt like a luxury Paris purchase. Substantial weight, flawless polishing, and fast delivery to Bengaluru. Ordering the matching necklace next!',
    date: '3 weeks ago'
  }
];
