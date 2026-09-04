"use client";

import { usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { IS_COMING_SOON } from "@/utils/comingSoon";
import { cn } from "@/lib/utils";

function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();
  const isHome =
    pathname === `/${locale}` || pathname === "/" || pathname === "";
  const home = !isHome;

  return (
    <main
      id="main-content"
      className={cn(
        "min-h-screen bg-background",
        IS_COMING_SOON && "blur-md pointer-events-none select-none"
      )}
    >
      {children}
    </main>
  );
}

export default MainContent;