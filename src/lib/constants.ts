export const APP_NAME = "Satvastones";
export const APP_DESCRIPTION = "Luxury Korean & Western Jewellery";

export const CATEGORIES = [
  { name: "Korean Jewellery", slug: "korean", image: "/images/korean.jpg" },
  { name: "Western Jewellery", slug: "western", image: "/images/western.jpg" },
  { name: "Traditional Jewellery", slug: "traditional", image: "/images/traditional.jpg" },
  { name: "Fusion Jewellery", slug: "fusion", image: "/images/fusion.jpg" },
  { name: "Earrings", slug: "earrings", image: "/images/earrings.jpg" },
  { name: "Necklaces", slug: "necklaces", image: "/images/necklaces.jpg" },
  { name: "Bracelets", slug: "bracelets", image: "/images/bracelets.jpg" },
  { name: "Rings", slug: "rings", image: "/images/rings.jpg" },
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Awaiting Payment",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export const PRODUCT_STYLES = [
  { value: "KOREAN", label: "Korean" },
  { value: "WESTERN", label: "Western" },
  { value: "TRADITIONAL", label: "Traditional" },
  { value: "FUSION", label: "Fusion" },
] as const;

export const MATERIALS = [
  "Gold Plated",
  "Silver Plated",
  "Rose Gold",
  "Sterling Silver",
  "Brass",
  "Stainless Steel",
  "Pearl",
  "Crystal",
  "Diamond",
  "Kundan",
  "Oxidized Silver",
] as const;

export const PRICE_RANGES = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 - ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 - ₹2,500", min: 1000, max: 2500 },
  { label: "₹2,500 - ₹5,000", min: 2500, max: 5000 },
  { label: "₹5,000 - ₹10,000", min: 5000, max: 10000 },
  { label: "Above ₹10,000", min: 10000, max: Infinity },
] as const;
