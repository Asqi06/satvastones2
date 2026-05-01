import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@satvastones.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@satvastones.com",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });
  console.log("Admin created:", admin.email);

  // Create demo customer
  const customerPassword = await bcrypt.hash("customer123", 12);
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      name: "Demo Customer",
      email: "customer@example.com",
      password: customerPassword,
      role: "CUSTOMER",
      emailVerified: new Date(),
    },
  });
  console.log("Customer created:", customer.email);

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

  // Create sample products
  const koreanCat = await prisma.category.findUnique({ where: { slug: "korean-jewellery" } });
  const westernCat = await prisma.category.findUnique({ where: { slug: "western-jewellery" } });
  const earringsCat = await prisma.category.findUnique({ where: { slug: "earrings" } });

  const products = [
    {
      name: "Korean Pearl Drop Earrings",
      slug: "korean-pearl-drop-earrings",
      description: "Elegant Korean-style pearl drop earrings with gold-plated hooks. Perfect for both casual and formal occasions. Features genuine freshwater pearls.",
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
      description: "Delicate Korean-inspired gold chain necklace. Ultra-thin design perfect for layering. 18K gold plated over sterling silver.",
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
      description: "Stunning Western-style crystal butterfly earrings. Sparkling Austrian crystals set in rose gold. Perfect for special occasions.",
      price: 1899,
      comparePrice: 2499,
      material: "Rose Gold",
      style: "WESTERN" as const,
      stock: 30,
      isFeatured: true,
      categoryId: westernCat?.id || "",
      images: [],
    },
    {
      name: "Korean Twisted Hoop Earrings",
      slug: "korean-twisted-hoop-earrings",
      description: "Trendy Korean-style twisted hoop earrings. Lightweight and comfortable for everyday wear. Sterling silver with rhodium plating.",
      price: 899,
      material: "Sterling Silver",
      style: "KOREAN" as const,
      stock: 50,
      isFeatured: false,
      categoryId: earringsCat?.id || "",
      images: [],
    },
    {
      name: "Vintage Western Locket",
      slug: "vintage-western-locket",
      description: "Beautiful vintage-inspired Western locket pendant. Holds two small photos inside. Antique gold finish with intricate filigree work.",
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
      description: "Set of 5 Korean-style dainty stackable rings. Mix and match to create your own look. Gold plated with adjustable sizing.",
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
