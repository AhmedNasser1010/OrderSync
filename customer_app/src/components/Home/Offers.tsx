"use client";

import { useRef } from "react";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import Slider, { Settings } from "react-slick";
import SectionHeader from "@/components/Home/SectionHeader";
import RestaurantCard from "@/components/ui/custom/RestaurantCard";
import { toCardInfo } from "@/components/Home/cardInfo";
import type { RestaurantDocument } from "@/types/restaurant";

const AUTO_SCROLL_INTERVAL = 3000;

function Offers({ restaurants }: { restaurants: RestaurantDocument[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === "ar";
  const sliderRef = useRef<Slider | null>(null);

  const settings: Settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1.15,
    slidesToScroll: 1,
    autoplay: restaurants.length > 1,
    autoplaySpeed: AUTO_SCROLL_INTERVAL,
    pauseOnHover: true,
    pauseOnFocus: true,
    arrows: false,
    rtl: isRTL,
    centerMode: true,
    centerPadding: "0px",
    responsive: [
      { breakpoint: 640, settings: { slidesToShow: 1.05 } },
    ],
  };

  if (restaurants.length < 1) return null;

  return (
    <>
      <div className="divider"></div>
      <section id="offers">
        <SectionHeader
          title={t("Offers just for you")}
          arrows
          onLeft={() => sliderRef.current?.slickPrev()}
          onRight={() => sliderRef.current?.slickNext()}
        />
        <div className="max-w-[1500px]">
          <Slider ref={sliderRef} {...settings}>
            {restaurants.map((res) => (
              <div key={res?.accessToken} className="px-1 sm:px-2">
                <Link
                  className="relative block transition-all hover:scale-95"
                  href={`/${res?.profile.name.split(" ").join("-")}`}
                >
                  <RestaurantCard info={toCardInfo(res, t)} />
                </Link>
              </div>
            ))}
          </Slider>
        </div>
      </section>
    </>
  );
}

export default Offers;
