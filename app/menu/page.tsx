import MenuHero from "@/components/MenuHero";
import MenuItemsSection from "@/components/MenuItemsSection";
import Footer from "@/components/Footer";

interface MenuPageProps {
  searchParams?: {
    name?: string;
    id?: string;
  };
}

export default function MenuPage({ searchParams }: MenuPageProps) {
  const restaurantId = searchParams?.id || "1";
  const restaurantName = searchParams?.name;

  return (
    <main className="min-h-screen w-full bg-white flex flex-col justify-between">
      <div>
        <MenuHero restaurantId={restaurantId} restaurantName={restaurantName} />
        <MenuItemsSection restaurantId={restaurantId} />
      </div>
      <Footer />
    </main>
  );
}
