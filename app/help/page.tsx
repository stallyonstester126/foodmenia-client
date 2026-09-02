import Navbar from "@/components/Navbar";

export default function HelpPage() {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col justify-between">
      <div className="w-full bg-[#FCBA08] pb-6 select-none">
        <Navbar activeTab="home" />
      </div>

      <main className="w-full max-w-[1196px] mx-auto px-6 sm:px-10 lg:px-12 py-10 sm:py-14 flex-1">
        <h1 className="font-mali uppercase text-[32px] sm:text-[38px] font-bold text-[#2B1B0E] mb-6">
          HELP CENTER
        </h1>

        <div className="flex flex-col gap-4 max-w-[800px]">
          <div className="rounded-[20px] border border-gray-200 p-5 bg-white shadow-sm">
            <h3 className="font-poppins font-bold text-base text-[#1A1A1A] mb-2">
              How do I track my order?
            </h3>
            <p className="font-poppins text-sm text-gray-500">
              Go to your Profile dropdown or click &quot;Track Your Order&quot; after placing an order to see live real-time status.
            </p>
          </div>

          <div className="rounded-[20px] border border-gray-200 p-5 bg-white shadow-sm">
            <h3 className="font-poppins font-bold text-base text-[#1A1A1A] mb-2">
              What payment methods are supported?
            </h3>
            <p className="font-poppins text-sm text-gray-500">
              We support Credit/Debit Cards (Mastercard, Visa), Cash on Delivery, and online wallets.
            </p>
          </div>
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
