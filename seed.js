import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/satvastones';

// Schemas (Local copies for seeding)
const productSchema = new mongoose.Schema({ title: String, price: Number, oldPrice: Number, rating: Number, reviews: Number, image: String, category: String, description: String });
const Product = mongoose.model('Product', productSchema);

const cmsSchema = new mongoose.Schema({ hero: Object, categories: Array, specialOffer: Object, settings: Object });
const CMS = mongoose.model('CMS', cmsSchema);

const initialCMSData = {
  hero: {
    title: "AESTHETIC KOREAN",
    subTitle: "VIBES ONLY",
    description: "High Quality Korean & Western Jewelry Designed for Your Unique Aesthetic Style.",
    image: "https://images.unsplash.com/photo-1515562141207-7a18b2ce73f3?auto=format&fit=crop&q=80&w=1500"
  },
  categories: [
    { title: 'RINGS', image: 'https://images.unsplash.com/photo-1605100804763-047af5f6f791?auto=format&fit=crop&q=80&w=800', size: 'large' },
    { title: 'EARRINGS', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800', size: 'small' },
    { title: 'PENDANT', image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=800', size: 'small' },
    { title: 'NECKLACES', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800', size: 'large' },
    { title: 'GIFTS', image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=800', size: 'large' },
    { title: 'HAMPERS', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=800', size: 'small' },
    { title: 'NEW ARRIVALS', image: 'https://images.unsplash.com/photo-1530103862676-fa8c9d34bb34?auto=format&fit=crop&q=80&w=800', size: 'small' },
    { title: 'SEASONAL SALE', image: 'https://images.unsplash.com/photo-1512403754473-27835f7b9984?auto=format&fit=crop&q=80&w=800', size: 'large', sale: true },
  ],
  specialOffer: {
    title: "Gift Her Aesthetic Love.",
    subTitle: "Aesthetic",
    description: "Our limited edition Mother's Day Luxury Hamper is designed for the queen who loves minimal elegance.",
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=800",
    productId: "md-hamper",
    isActive: true
  },
  products: [
    { title: "MOTHER'S DAY LUXURY HAMPER", price: 1299, oldPrice: 1999, rating: 5.0, reviews: 15, image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=800', category: 'HAMPERS', description: "Celebrate the queen of your heart with our limited edition Mother's Day Luxury Hamper." },
    { title: 'KOREAN VELVET CHOKER', price: 299, oldPrice: 450, rating: 4.9, reviews: 89, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800', category: 'NECKLACES' },
    { title: 'AESTHETIC BUTTERFLY STUDS', price: 199, oldPrice: 350, rating: 4.8, reviews: 54, image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=800', category: 'EARRINGS' },
    { title: 'WESTERN MINIMALIST RING', price: 249, oldPrice: 399, rating: 4.7, reviews: 120, image: 'https://images.unsplash.com/photo-1590548784585-643d2b9f2912?auto=format&fit=crop&q=80&w=800', category: 'RINGS' },
    { title: 'KAWAII PEARL HAIRPIN', price: 149, oldPrice: 250, rating: 4.9, reviews: 210, image: 'https://images.unsplash.com/photo-1630030532634-1dc30c729bc1?auto=format&fit=crop&q=80&w=800', category: 'ACCESSORIES' },
    { title: 'VINTAGE FLOWER EARRINGS', price: 279, oldPrice: 400, rating: 4.6, reviews: 45, image: 'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&q=80&w=800', category: 'EARRINGS' },
    { title: 'Y2K STAR PENDANT', price: 329, oldPrice: 499, rating: 4.9, reviews: 112, image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=800', category: 'NECKLACES' },
  ],
  settings: {
    announcementText: "MOTHER'S DAY LIVE SALE — SPECIAL GIFT HAMPERS INSIDE!",
    showTimer: true,
    timerDays: 3
  }
};

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB for seeding...');

    // Clear existing
    await Product.deleteMany({});
    await CMS.deleteMany({});

    // Drop stale indexes (fixes Duplicate Key Error on 'slug')
    try {
      await Product.collection.dropIndexes();
      console.log('Stale indexes dropped.');
    } catch (e) {
      console.log('No indexes to drop.');
    }

    // Seed Products
    const productsWithIds = initialCMSData.products.map(p => ({
      ...p,
      _id: new mongoose.Types.ObjectId()
    }));
    await Product.insertMany(productsWithIds);
    console.log('Products seeded!');

    // Seed CMS
    const { products, ...cmsOnly } = initialCMSData;
    // Link the Mother's Day special offer to the first product (Hamper)
    cmsOnly.specialOffer.productId = productsWithIds[0]._id;
    
    await CMS.create(cmsOnly);
    console.log('CMS data seeded!');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
