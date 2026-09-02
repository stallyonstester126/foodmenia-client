import ProductDetailSection from "@/components/ProductDetailSection";

interface DynamicProductPageProps {
  params: {
    id: string;
  };
}

const productDataMap: { [key: string]: { name: string; price: string; image: string } } = {
  "1": { name: "Leg Tikka", price: "Rs. 480.00", image: "/promo_chicken.png" },
  "2": { name: "Breast Tikka", price: "Rs. 480.00", image: "/item2.png" },
  "3": { name: "Piza", price: "Rs. 480.00", image: "/item1.png" },
  "4": { name: "Zinger Burger", price: "Rs. 480.00", image: "/hero.png" },
  "5": { name: "Beef Burger", price: "Rs. 480.00", image: "/hero.png" },
  "6": { name: "Bash Burger", price: "Rs. 480.00", image: "/item1.png" },
  "7": { name: "Piza Burger", price: "Rs. 480.00", image: "/item3.png" },
  "8": { name: "Zinger Burger", price: "Rs. 480.00", image: "/promo_chicken.png" },
  "jumbo-zinger": { name: "JUMBO ZINGER BURGER", price: "Rs. 720.00", image: "/hero.png" },
};

export default function DynamicProductPage({ params }: DynamicProductPageProps) {
  const item = productDataMap[params.id] || {
    name: params.id ? decodeURIComponent(params.id).toUpperCase().replace(/-/g, " ") : "JUMBO ZINGER BURGER",
    price: "Rs. 720.00",
    image: "/hero.png",
  };

  return <ProductDetailSection itemId={params.id} title={item.name} price={item.price} image={item.image} />;
}
