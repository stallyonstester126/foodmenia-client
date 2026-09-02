import RestaurantHero from "@/components/RestaurantHero";
import CategoryRestaurantsSection from "@/components/CategoryRestaurantsSection";
import Footer from "@/components/Footer";

export default function RestaurantPage() {
  return (
    <main className="min-h-screen w-full bg-white flex flex-col justify-between">
      <div>
        <RestaurantHero />
        <CategoryRestaurantsSection />
      </div>
      <Footer />
    </main>
  );
}
