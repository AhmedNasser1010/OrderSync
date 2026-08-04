"use client";

import type { ReactNode } from "react";
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

function BannerCta({ banner }: { banner: HeroBannerType }) {
  const locale = useLocale();

  const label = locale === "ar" ? banner.cta.labelAr : banner.cta.labelEn;
  const href = banner.cta.href;

  const buttonStyle = {
    backgroundColor: banner.cta.backgroundColor || "#fc8019",
    color: banner.cta.textColor || "#ffffff",
    borderColor: banner.cta.borderColor || undefined,
    borderWidth: banner.cta.borderWidth ? `${banner.cta.borderWidth}px` : undefined,
    borderStyle: banner.cta.borderWidth ? "solid" as const : undefined,
    borderRadius: banner.cta.borderRadius !== undefined ? `${banner.cta.borderRadius}px` : "9999px",
    fontFamily: banner.cta.fontFamily || undefined,
    fontSize: banner.cta.fontSize ? `${banner.cta.fontSize}px` : undefined,
    fontWeight: banner.cta.fontWeight || "600",
  };

  const baseClass =
    "mt-2 flex items-center gap-2 px-5 py-2.5 shadow-lg transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-white/60 outline-none cursor-pointer";

  let cta: ReactNode = null;
  if (label && href) {
    if (/^https?:\/\//i.test(href)) {
      cta = (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClass}
          style={buttonStyle}
        >
          {label}
        </a>
      );
    } else if (href.startsWith("#")) {
      cta = (
        <button
          type="button"
          onClick={() =>
            document
              .getElementById(href.slice(1))
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className={baseClass}
          style={buttonStyle}
        >
          {label}
        </button>
      );
    } else {
      cta = (
        <Link href={href} className={baseClass} style={buttonStyle}>
          {label}
        </Link>
      );
    }
  }

  return cta;
}

function BannerCard({ banner }: { banner: HeroBannerType }) {
  const posX = banner.ctaPosition?.x ?? 16;
  const posY = banner.ctaPosition?.y ?? 16;
  const corner = banner.ctaPosition?.corner ?? "top-left";

  const positionStyle: Record<string, string> = {};
  if (corner === "top-left") {
    positionStyle.left = `${posX}px`;
    positionStyle.top = `${posY}px`;
  } else if (corner === "top-right") {
    positionStyle.right = `${posX}px`;
    positionStyle.top = `${posY}px`;
  } else if (corner === "bottom-left") {
    positionStyle.left = `${posX}px`;
    positionStyle.bottom = `${posY}px`;
  } else {
    positionStyle.right = `${posX}px`;
    positionStyle.bottom = `${posY}px`;
  }

  return (
    <div className="relative h-55 w-full overflow-hidden rounded-3xl bg-secondary sm:h-52">
      {banner.imageUrl && (
        <img
          src={banner.imageUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute" style={positionStyle}>
        <BannerCta banner={banner} />
      </div>
    </div>
  );
}

function HeroBanner() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const { data: banners } = useFetchBannersQuery();

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
