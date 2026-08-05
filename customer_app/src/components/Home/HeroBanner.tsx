"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Slider from "react-slick";
import { ArrowDownIcon } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useFetchBannersQuery } from "@/rtk/api/firestoreApi";
import type { HeroBanner as HeroBannerType } from "@ordersync/types";

const AUTO_SCROLL_INTERVAL = 4000;

function DefaultHero() {
  const t = useTranslations();

  const scrollToRestaurants = () => {
    document
      .getElementById("restaurants")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-color-2 via-[#ff8c3b] to-[#ffab4a]">
      <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/30" />
      <div className="relative flex flex-col items-start gap-4 px-6 py-10 sm:px-12 sm:py-14">
        <p className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-ProximaNovaSemiBold uppercase tracking-widest text-white backdrop-blur-sm">
          {t("Zajil")}
        </p>
        <h2 className="max-w-xl font-ProximaNovaBlack text-3xl leading-tight text-white sm:text-5xl">
          {t("Hero title")}
        </h2>
        <p className="max-w-md font-ProximaNovaThin text-base text-white/90 sm:text-lg">
          {t("Hero subtitle")}
        </p>
        <button
          type="button"
          onClick={scrollToRestaurants}
          className="mt-2 flex items-center gap-2 rounded-full bg-white px-6 py-3 font-ProximaNovaSemiBold text-[#282c3f] shadow-lg transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-white/60 outline-none cursor-pointer"
        >
          {t("Order now")}
          <ArrowDownIcon className="size-4" />
        </button>
      </div>
    </section>
  );
}

function BannerCard({ banner }: { banner: HeroBannerType }) {
  const href = banner.href;

  const content = (
    <>
      {banner.imageUrl && (
        <Image
          src={banner.imageUrl}
          alt=""
          loading="lazy"
          fill
          sizes="100vw"
          className="object-cover"
        />
      )}
    </>
  );

  const baseClass =
    "relative h-55 w-full overflow-hidden rounded-3xl bg-secondary sm:h-52 outline-none";

  if (!href) {
    return <div className={baseClass}>{content}</div>;
  }

  const actionClass =
    "block transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-color-2/60 cursor-pointer";

  if (/^https?:\/\//i.test(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClass} ${actionClass}`}
      >
        {content}
      </a>
    );
  }

  if (href.startsWith("#")) {
    return (
      <button
        type="button"
        onClick={() =>
          document
            .getElementById(href.slice(1))
            ?.scrollIntoView({ behavior: "smooth" })
        }
        className={`${baseClass} ${actionClass}`}
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className={`${baseClass} ${actionClass}`}>
      {content}
    </Link>
  );
}

function HeroBannerSkeleton() {
  return (
    <section className="mt-6" id="hero">
      <div className="relative h-55 w-full overflow-hidden rounded-3xl bg-secondary animate-pulse sm:h-52">
        <div className="absolute top-4 left-4 size-16 rounded-2xl bg-color-7/70" />
      </div>
    </section>
  );
}

function HeroBanner() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const { data: banners, isLoading } = useFetchBannersQuery();

  if (isLoading) return <HeroBannerSkeleton />;

  if (!banners || banners.length === 0) return <DefaultHero />;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: banners.length > 1,
    autoplaySpeed: AUTO_SCROLL_INTERVAL,
    pauseOnHover: true,
    pauseOnFocus: true,
    arrows: false,
    rtl: isRTL,
    customPaging: (i: number) => (
      <button type="button" aria-label={`Go to slide ${i + 1}`} />
    ),
    appendDots: (dots: ReactNode) => (
      <div>
        <ul className="m-0 flex list-none items-center gap-2 rounded-full bg-black/25 px-3 py-1.5 backdrop-blur-sm">
          {dots}
        </ul>
      </div>
    ),
  };

  return (
    <section className="mt-6" id="hero">
      <Slider {...settings} className="hero-banner-slider">
        {banners.map((banner) => (
          <BannerCard key={banner.id} banner={banner} />
        ))}
      </Slider>
    </section>
  );
}

export default HeroBanner;
