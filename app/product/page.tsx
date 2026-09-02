import ProductDetailSection from "@/components/ProductDetailSection";

interface ProductPageProps {
  searchParams?: {
    id?: string;
    name?: string;
    price?: string;
    image?: string;
  };
}

export default function ProductPage({ searchParams }: ProductPageProps) {
  const itemId = searchParams?.id || "item_3";
  const title = searchParams?.name || "JUMBO ZINGER BURGER";
  const price = searchParams?.price || "Rs. 720.00";
  const image = searchParams?.image || "/hero.png";

  return <ProductDetailSection itemId={itemId} title={title} price={price} image={image} />;
}
