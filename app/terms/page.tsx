import Navbar from "@/components/Navbar";

export default function TermsPage() {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col justify-between">
      <div className="w-full bg-[#FCBA08] pb-6 select-none">
        <Navbar activeTab="home" />
      </div>

      <main className="w-full max-w-[1196px] mx-auto px-6 sm:px-10 lg:px-12 py-10 sm:py-14 flex-1">
        <h1 className="font-mali uppercase text-[32px] sm:text-[38px] font-bold text-[#2B1B0E] mb-6">
          TERMS &amp; CONDITIONS
        </h1>

        <div className="font-poppins text-sm text-gray-600 leading-relaxed flex flex-col gap-4 max-w-[900px]">
          <p>
            Welcome to FoodMenia. By accessing or using our services, you agree to be bound by these terms and conditions.
          </p>
          <p>
            All food prices, delivery fees, and platform taxes are calculated dynamically and shown clearly prior to order placement.
          </p>
        </div>
      </main>

      <footer className="w-full bg-[#FCBA08] py-4 px-6 text-center select-none">
        <p className="font-poppins text-xs sm:text-sm text-[#2B1B0E] font-semibold tracking-normal">
          © 2026 Food Menia All rights reserved.
        </p>
      </footer>
    </div>
  );
}
