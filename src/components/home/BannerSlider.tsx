"use client";

import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { ArrowRight } from "lucide-react";
import { banners } from "@/lib/data/banners";

import "swiper/css";
import "swiper/css/pagination";

export default function BannerSlider() {
  return (
    <section className="container-px mx-auto max-w-[1600px] py-16 sm:py-24">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className="rounded-3xl overflow-hidden !pb-12"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <Link
              href={banner.href}
              className="relative flex h-[360px] w-full items-end overflow-hidden sm:h-[440px]"
            >
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-verde-escuro/80 via-verde-escuro/20 to-transparent" />
              <div className="relative z-10 p-8 sm:p-12">
                <p className="text-xs font-semibold uppercase tracking-widest text-verde-claro">
                  Coleção
                </p>
                <h3 className="mt-2 font-display text-3xl font-semibold text-branco sm:text-5xl">
                  {banner.title}
                </h3>
                <p className="mt-2 max-w-md text-sm text-areia/85 sm:text-base">
                  {banner.subtitle}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-branco underline decoration-verde-claro decoration-2 underline-offset-4">
                  {banner.cta}
                  <ArrowRight size={15} />
                </span>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
