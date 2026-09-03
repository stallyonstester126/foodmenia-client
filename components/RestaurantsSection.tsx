"use client";

import Image from "next/image";
import Link from "next/link";
import { useRestaurants } from "@/lib/useRestaurantData";
import FavoriteButton from "@/components/FavoriteButton";

export default function RestaurantsSection() {
  const { data: restaurants, isLoading } = useRestaurants({ type: "restaurant" });

  return (
    <section className="relative w-full bg-white overflow-hidden py-14 sm:py-18 lg:py-20">
      {/* 1. Top-Left: Large Yellow Egg Shape with Peeking Sloth (sloth_sticker_2) */}
      <div className="absolute top-0 left-0 -translate-x-10 sm:-translate-x-12 -translate-y-6 pointer-events-none select-none z-0">
        <div className="relative w-[180px] sm:w-[230px] lg:w-[260px] h-[240px] sm:h-[300px] lg:h-[340px]">
          {/* Yellow Egg Background */}
          <div className="absolute inset-0 bg-[#FCBA08] rounded-[50%] -rotate-12 opacity-100" />
          {/* Sloth Resting & Peeking */}
          <div className="absolute top-14 left-8 sm:top-18 sm:left-10 lg:top-20 lg:left-11 w-20 sm:w-28 lg:w-32 h-auto z-10">
            <Image
              src="/sloth_sticker_2.png"
              alt=""
              width={125}
              height={170}
              className="w-full h-auto object-contain drop-shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* 2. Top-Right: Glowing Golden Yellow Planet Outline with Ring */}
      <div className="absolute top-0 right-2 sm:right-8 lg:right-14 w-28 sm:w-36 lg:w-48 h-auto pointer-events-none select-none z-0 opacity-85 rotate-[-10deg]">
        <Image
          src="/planet.png"
          alt=""
          width={600}
          height={600}
          className="w-full h-auto object-contain"
        />
      </div>

      {/* 3. Middle-Left: Glowing Golden Yellow Planet Outline with Ring */}
      <div className="absolute top-[46%] -left-8 sm:-left-12 w-32 sm:w-40 lg:w-52 h-auto pointer-events-none select-none z-0 opacity-80 rotate-[30deg]">
        <Image
          src="/planet.png"
          alt=""
          width={600}
          height={600}
          className="w-full h-auto object-contain"
        />
      </div>

      {/* 4. Middle-Right: Yellow Blob with Peeking Sloth on Top-Left Curve */}
      <div className="absolute top-[41%] sm:top-[43%] lg:top-[44%] right-0 translate-x-[35%] sm:translate-x-[30%] lg:translate-x-[25%] pointer-events-none select-none z-0">
        <div className="relative w-[280px] h-[220px] sm:w-[330px] sm:h-[260px] lg:w-[380px] lg:h-[300px]">
          <div
            className="absolute inset-0 bg-[#FCBA08]"
            style={{
              borderRadius: "55% 45% 45% 55% / 60% 60% 40% 40%",
              transform: "rotate(180deg)",
            }}
          />
          <div className="absolute -top-8 left-8 sm:-top-10 sm:left-12 lg:-top-12 lg:left-16 w-24 sm:w-32 lg:w-36 h-auto z-10">
            <Image
              src="/sloth_sticker_1.png"
              alt=""
              width={206}
              height={241}
              className="w-full h-auto object-contain drop-shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[1196px] mx-auto px-6 sm:px-10 lg:px-12">
        {/* Section Heading */}
        <h2 className="font-mali text-[26px] sm:text-[30px] md:text-[34px] font-bold text-[#2B1B0E] uppercase tracking-wide mb-6 sm:mb-8 select-none">
          TRY SOMETHING NEW
        </h2>

        {/* 2-Column Restaurant Cards Grid (Max 6 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7 lg:gap-8">
          {isLoading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-[20px] sm:rounded-[24px] border border-gray-200 h-[280px] bg-gray-100 animate-pulse"
                />
              ))
            : (Array.isArray(restaurants)
                ? restaurants
                : (restaurants as unknown as { items?: typeof restaurants; restaurants?: typeof restaurants; data?: typeof restaurants })?.items ||
                  (restaurants as unknown as { items?: typeof restaurants; restaurants?: typeof restaurants; data?: typeof restaurants })?.restaurants ||
                  (restaurants as unknown as { items?: typeof restaurants; restaurants?: typeof restaurants; data?: typeof restaurants })?.data ||
                  []
              ).filter((item) => !item.type || item.type === "restaurant").slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="rounded-[20px] sm:rounded-[24px] border border-gray-200/90 shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden cursor-pointer group flex flex-col bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative"
                >
                  {/* Favorite Heart Button */}
                  <FavoriteButton entityType={(item.type as "restaurant" | "shop") || "restaurant"} entityId={item.id} />

                  <Link href={`/menu/${item.id}`} className="w-full flex flex-col">
                    {/* Restaurant Hero Image */}
                    <div className="relative w-full aspect-[16/9.5] sm:aspect-[16/9.2] bg-gray-50 overflow-hidden rounded-t-[19px] sm:rounded-t-[23px]">
                      <Image
                        src={item.image || "/ResturantHero.png"}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                    </div>

                    {/* Card Details */}
                    <div className="p-4 sm:p-5 flex flex-col gap-1 bg-transparent">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[#2B1B0E] flex-shrink-0">
                            <svg className="w-4 h-4 text-[#2B1B0E] fill-current" viewBox="0 0 24 24">
                              <path d="M12 2l2.4 5 5.6.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.6-.8z" />
                            </svg>
                          </span>
                          <h3 className="font-poppins font-bold text-[15px] sm:text-[16px] text-[#2B1B0E] truncate">
                            {item.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-[#FCBA08] text-sm leading-none">★</span>
                          <span className="font-poppins text-xs sm:text-sm text-gray-500 font-medium">
                            {item.rating || "4.8"}
                          </span>
                        </div>
                      </div>

                      <p className="font-poppins text-xs sm:text-[13px] text-gray-500 font-normal pl-6">
                        · {item.cuisine || "Asian · Chinese · Bar B Q"}
                      </p>

                      <div className="pl-6 mt-1 flex items-center gap-1.5 text-gray-400 text-xs font-poppins">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>{item.deliveryTime || "20-35 mins"} · {item.isFreeDelivery ? "Free Delivery" : "Standard Delivery"}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
