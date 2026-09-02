"use client";

import Image from "next/image";

export default function PromoBannerSection() {
  return (
    <section className="relative w-full bg-white overflow-hidden py-10 sm:py-14 lg:py-16">
      {/* Decorative Liquid Splash on Bottom Left */}
      <div className="absolute left-0 bottom-0 w-[140px] sm:w-[180px] md:w-[220px] lg:w-[250px] pointer-events-none select-none z-0 -translate-x-6 sm:-translate-x-8 translate-y-4 sm:translate-y-6 rotate-180">
        <Image
          src="/liquid.png"
          alt=""
          width={1200}
          height={896}
          className="w-full h-auto object-contain object-left-bottom"
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[1196px] mx-auto px-6 sm:px-10 lg:px-12">
        {/* Banner Card */}
        <div className="relative w-full rounded-[20px] sm:rounded-[24px] bg-[#FCBA08] overflow-hidden shadow-[0_10px_30px_rgba(252,186,8,0.22)] flex flex-col md:flex-row items-center justify-between pl-6 sm:pl-12 lg:pl-14 pr-0 py-8 sm:py-10 lg:py-0 lg:h-[300px] gap-6">
          {/* Subtle Wave Background in Banner */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-50 select-none">
            <Image
              src="/herobackground.png"
              alt=""
              fill
              className="object-cover object-center"
            />
          </div>

          {/* Left Text Block */}
          <div className="relative z-10 flex flex-col items-start text-left max-w-[480px] py-4">
            <h2 className="font-mali uppercase text-[28px] sm:text-[34px] md:text-[38px] lg:text-[42px] leading-[1.08] text-[#2B1B0E] font-bold tracking-wide select-none drop-shadow-sm">
              SAVE ON YOUR FUTURE
            </h2>
            <p className="font-poppins font-bold text-white text-[17px] sm:text-[21px] md:text-[23px] mt-2 select-none tracking-normal">
              order with food menia
            </p>
          </div>

          {/* Right 3D Visual Collage */}
          <div className="relative z-10 flex items-center justify-end h-full w-full md:w-auto mt-4 md:mt-0 flex-shrink-0 pr-0">
            {/* Free Delivery 3D Coupon / Bag Asset */}
            <div className="relative w-[180px] sm:w-[220px] md:w-[260px] lg:w-[285px] h-auto flex-shrink-0 -mr-8 sm:-mr-12 lg:-mr-14 z-10">
              <Image
                src="/promo_freedelivery.png"
                alt="Free Delivery Promo"
                width={367}
                height={367}
                className="w-full h-auto object-contain select-none"
              />
            </div>

            {/* Crispy Chicken Tender Dipping (Flush to right corner) */}
            <div className="relative w-[160px] sm:w-[200px] md:w-[240px] lg:w-[270px] h-auto flex-shrink-0 z-20 flex items-center justify-end">
              <Image
                src="/promo_chicken.png"
                alt="Crispy Chicken"
                width={351}
                height={438}
                className="w-full h-auto object-contain object-right select-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

