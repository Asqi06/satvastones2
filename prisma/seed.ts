import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

// Prisma 7 does not load .env automatically. Match Next.js precedence:
// .env first, then .env.local overrides it.
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnv({ path: path.join(rootDir, ".env"), quiet: true });
loadEnv({ path: path.join(rootDir, ".env.local"), override: true, quiet: true });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to .env or .env.local before seeding.");
}

// MongoDB Atlas needs no driver adapter — plain client is enough.
const prisma = new PrismaClient();

function genReferralCode(prefix: string) {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}${rand}`;
}

async function upsertUserWithReferral(
  email: string,
  data: { name: string; password: string; role: "ADMIN" | "CUSTOMER" }
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (!existing.referralCode) {
      const code = genReferralCode(existing.role === "ADMIN" ? "ADM" : "USR");
      const updated = await prisma.user.update({
        where: { email },
        data: { referralCode: code },
      });
      console.log(`Updated referralCode for ${email}: ${code}`);
      return updated;
    }
    console.log(`User exists: ${email} (referralCode: ${existing.referralCode})`);
    return existing;
  }
  const code = genReferralCode(data.role === "ADMIN" ? "ADM" : "USR");
  const created = await prisma.user.create({
    data: {
      name: data.name,
      email,
      password: data.password,
      role: data.role,
      emailVerified: new Date(),
      referralCode: code,
    },
  });
  console.log(`User created: ${email} (referralCode: ${code})`);
  return created;
}

async function main() {
  // Create admin user (MongoDB unique on referralCode is NOT sparse — two nulls would collide)
  const adminPassword = await bcrypt.hash("admin123", 12);
  await upsertUserWithReferral("admin@satvastones.com", {
    name: "Admin",
    password: adminPassword,
    role: "ADMIN",
  });

  // Create demo customer
  const customerPassword = await bcrypt.hash("customer123", 12);
  await upsertUserWithReferral("customer@example.com", {
    name: "Demo Customer",
    password: customerPassword,
    role: "CUSTOMER",
  });

  // Create categories
  const categories = [
    { name: "Korean Jewellery", slug: "korean-jewellery", description: "Minimalist Korean-style designs" },
    { name: "Western Jewellery", slug: "western-jewellery", description: "Contemporary Western designs" },
    { name: "Traditional Jewellery", slug: "traditional-jewellery", description: "Classic Indian designs" },
    { name: "Fusion Jewellery", slug: "fusion-jewellery", description: "East meets West" },
    { name: "Earrings", slug: "earrings", description: "All types of earrings" },
    { name: "Necklaces", slug: "necklaces", description: "Pendants, chains, sets" },
    { name: "Bracelets", slug: "bracelets", description: "Bangles and bracelets" },
    { name: "Rings", slug: "rings", description: "Statement and everyday rings" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("Categories created");

  // Fix existing MongoDB unique-sparse gap: optional @unique `sku` with multiple nulls collides.
  // Prisma's `where: { sku: null }` does not match MongoDB nulls reliably — filter in JS instead.
  const allProductsForFix = await prisma.product.findMany({ select: { id: true, slug: true, sku: true } });
  const nullSkuProducts = allProductsForFix.filter((p) => p.sku === null);
  for (const p of nullSkuProducts) {
    const sku = `SKU-${p.slug.toUpperCase().replace(/[^A-Z0-9]/g, "-").slice(0, 24)}-${p.id.slice(-4).toUpperCase()}`;
    await prisma.product.update({ where: { id: p.id }, data: { sku } });
    console.log(`Fixed null sku for ${p.slug} -> ${sku}`);
  }

  // Create sample products — every product gets a unique sku (MongoDB @unique on optional field would collide on multiple nulls)
  const koreanCat = await prisma.category.findUnique({ where: { slug: "korean-jewellery" } });
  const westernCat = await prisma.category.findUnique({ where: { slug: "western-jewellery" } });
  const earringsCat = await prisma.category.findUnique({ where: { slug: "earrings" } });

  const products = [
    {
      name: "Korean Pearl Drop Earrings",
      slug: "korean-pearl-drop-earrings",
      sku: "SKU-KOREAN-PEARL-DROP-001",
      description: "Elegant Korean-style pearl drop earrings with gold-plated hooks. Perfect for both casual and formal occasions. Features genuine freshwater pearls. Anti-tarnish and waterproof — safe for showers, workouts, and everyday wear.",
      price: 1299,
      comparePrice: 1999,
      material: "Gold Plated",
      style: "KOREAN" as const,
      stock: 25,
      isFeatured: true,
      categoryId: earringsCat?.id || "",
      images: [],
    },
    {
      name: "Minimalist Gold Chain Necklace",
      slug: "minimalist-gold-chain-necklace",
      sku: "SKU-MINIMALIST-CHAIN-002",
      description: "Delicate Korean-inspired gold chain necklace. Ultra-thin design perfect for layering. 18K gold plated over a durable base — anti-tarnish, waterproof, and skin-safe for daily wear.",
      price: 2499,
      material: "18K Gold Plated",
      style: "KOREAN" as const,
      stock: 15,
      isFeatured: true,
      categoryId: koreanCat?.id || "",
      images: [],
    },
    {
      name: "Crystal Butterfly Earrings",
      slug: "crystal-butterfly-earrings",
      sku: "SKU-CRYSTAL-BUTTERFLY-003",
      description: "Stunning Western-style crystal butterfly earrings. Sparkling crystals set in rose gold-plated metal. Anti-tarnish, waterproof, and nickel-free for all-day sparkle.",
      price: 1899,
      comparePrice: 2499,
      material: "Rose Gold Plated",
      style: "WESTERN" as const,
      stock: 30,
      isFeatured: true,
      categoryId: westernCat?.id || "",
      images: [],
    },
    {
      name: "Korean Twisted Hoop Earrings",
      slug: "korean-twisted-hoop-earrings",
      sku: "SKU-TWISTED-HOOP-004",
      description: "Trendy Korean-style twisted hoop earrings. Lightweight and comfortable for everyday wear. Hypoallergenic stainless steel — anti-tarnish, waterproof, and sweatproof.",
      price: 899,
      material: "Stainless Steel",
      style: "KOREAN" as const,
      stock: 50,
      isFeatured: false,
      categoryId: earringsCat?.id || "",
      images: [],
    },
    {
      name: "Vintage Western Locket",
      slug: "vintage-western-locket",
      sku: "SKU-VINTAGE-LOCKET-005",
      description: "Beautiful vintage-inspired Western locket pendant. Holds two small photos inside. Antique gold finish with intricate filigree work. Anti-tarnish coating keeps it bright through everyday wear.",
      price: 3499,
      comparePrice: 4499,
      material: "Brass",
      style: "WESTERN" as const,
      stock: 10,
      isFeatured: true,
      categoryId: westernCat?.id || "",
      images: [],
    },
    {
      name: "Korean Dainty Ring Set",
      slug: "korean-dainty-ring-set",
      sku: "SKU-DAINTY-RING-SET-006",
      description: "Set of 5 Korean-style dainty stackable rings. Mix and match to create your own look. Gold plated with adjustable sizing. Anti-tarnish, waterproof, and skin-safe for daily stacking.",
      price: 799,
      material: "Gold Plated",
      style: "KOREAN" as const,
      stock: 40,
      isFeatured: false,
      categoryId: koreanCat?.id || "",
      images: [],
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }
  console.log("Products created");

  // Create sample coupons
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrder: 500,
      maxUses: 100,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "FLAT200" },
    update: {},
    create: {
      code: "FLAT200",
      discountType: "FIXED",
      discountValue: 200,
      minOrder: 1500,
      maxUses: 50,
      isActive: true,
    },
  });
  console.log("Coupons created");

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
