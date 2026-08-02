"use client";

import { useRef } from "react";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import SectionHeader from "@/components/Home/SectionHeader";
import RestaurantCard from "@/components/ui/custom/RestaurantCard";
import { toCardInfo } from "@/components/Home/cardInfo";
import { cn } from "@/lib/utils";
import type { RestaurantDocument } from "@/types/restaurant";

interface RestaurantCarouselProps {
  id: string;
  title: string;
  subtitle?: string;
  restaurants: RestaurantDocument[];
  className?: string;
  cardWidth?: string;
}

function RestaurantCarousel({
  id,
  title,
  subtitle,
  restaurants,
  className,
  cardWidth = "w-72",
}: RestaurantCarouselProps) {
  const ref = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const t = useTranslations();
  const isRTL = locale === "ar";

  const scrollBy = (dir: number) => {
    ref.current?.scrollBy({ left: dir * 250, behavior: "smooth" });
  };

  const onLeft = () => scrollBy(isRTL ? 250 : -250);
  const onRight = () => scrollBy(isRTL ? -250 : 250);

  return (
    <section id={id}>
      <SectionHeader title={title} subtitle={subtitle} arrows onLeft={onLeft} onRight={onRight} />
      <div
        ref={ref}
        className={cn(
          "flex gap-6 overflow-x-scroll scroll-smooth scrollbar-hide max-w-[1500px] pb-2",
          className
        )}
      >
        {restaurants.map((res) => (
          <div className={cn("shrink-0", cardWidth)} key={res?.accessToken}>
            <Link
              className="relative block transition-all hover:scale-95"
              href={`/${res?.profile.name.split(" ").join("-")}`}
            >
              <RestaurantCard info={toCardInfo(res, t)} />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RestaurantCarousel;
