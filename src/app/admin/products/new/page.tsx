import ProductForm from "./ProductForm";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  return <ProductForm productId={params.id} />;
}
