import { Suspense } from "react";
import HeroBanner, { HeroBannerSkeleton } from "@/components/Home/HeroBanner";
import ReorderSection from "@/components/Home/ReorderSection";
import WhatsOnYourMind from "@/components/Home/WhatsOnYourMind";
import PopularDishes from "@/components/Home/PopularDishes";
import {
  IS_REORDER_ENABLED,
  IS_POPULAR_DISHES_ENABLED,
} from "@/utils/featureFlags";
import Restaurants from "@/components/Home/Restaurants";
import CtaStrip from "@/components/Home/CtaStrip";
import HomeGreeting from "@/components/Home/HomeGreeting";
import RestaurantsHydrator from "@/components/Home/RestaurantsHydrator";
import {
  WhatsOnYourMindSkeleton,
  PopularDishesSkeleton,
  RestaurantsSkeleton,
} from "@/components/Shimmer/HomeSkeletons";
import { getBanners } from "@/lib/server/banners";
import { getBusinesses } from "@/lib/server/restaurants";

/**
 * Rebuild the prerendered homepage (and re-fetch businesses) at most once
 * every 60 seconds.
 */
export const revalidate = 60;


/**
 * The homepage is now a Server Component with one Suspense boundary per
 * data-driven section. The shell (greeting, hero, CTA) renders immediately,
 * and each section streams in as its own data resolves — instead of every
 * section waiting for the slowest fetch before swapping skeletons at once.
 *
 * All sections share the same request-cached `getBusinesses()` read, so the
 * three boundaries below resolve together (one Firestore read per request)
 * while ReorderSection / menus keep loading on the client independently.
 */

async function WhatsOnYourMindSection() {
  const restaurants = await getBusinesses();
  if (restaurants.length === 0) return null;
  return <WhatsOnYourMind restaurants={restaurants} />;
}

async function PopularDishesSection() {
  const restaurants = await getBusinesses();
  if (restaurants.length === 0) return null;
  return <PopularDishes restaurants={restaurants} />;
}

async function RestaurantsSection() {
  const restaurants = await getBusinesses();
  if (restaurants.length === 0) return null;
  return <Restaurants restaurants={restaurants} />;
}

/**
 * Streams the banners server-side so the hero section no longer waits for a
 * client-side RTK Query fetch after hydration. Banners resolve from a single
 * collection query, so they appear as one unit — but immediately with the
 * page stream rather than after a client fetch.
 */
async function HeroBannerSection() {
  const banners = await getBanners();
  return <HeroBanner banners={banners} />;
}

/**
 * Hydrates the Redux `restaurants` slice from the same server data so
 * client-only consumers (RestaurantSearch, OrderSidebar, ReorderSection)
 * keep working without a duplicate client-side Firestore fetch.
 */
async function RestaurantsHydrationSection() {
  const restaurants = await getBusinesses();
  return <RestaurantsHydrator restaurants={restaurants} />;
}

export default function HomePage() {
  return (
    <div className="container mx-auto overflow-x-clip px-0 pb-24 sm:px-10">
      <HomeGreeting />

      <Suspense fallback={<WhatsOnYourMindSkeleton />}>
        <WhatsOnYourMindSection />
      </Suspense>

      <div className="px-4 sm:px-0">
        <Suspense fallback={<HeroBannerSkeleton />}>
          <HeroBannerSection />
        </Suspense>
        {IS_REORDER_ENABLED && <ReorderSection />}

        {IS_POPULAR_DISHES_ENABLED && (
          <Suspense fallback={<PopularDishesSkeleton />}>
            <PopularDishesSection />
          </Suspense>
        )}

        <Suspense fallback={<RestaurantsSkeleton />}>
          <RestaurantsSection />
        </Suspense>

        <CtaStrip />
      </div>

      <Suspense fallback={null}>
        <RestaurantsHydrationSection />
      </Suspense>
    </div>
  );
}
