"use client";

import { usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { IS_COMING_SOON, isComingSoonExemptPath } from "@/utils/comingSoon";
import { cn } from "@/lib/utils";

function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();
  const isHome =
    pathname === `/${locale}` || pathname === "/" || pathname === "";
  const home = !isHome;
  const comingSoonBlur = IS_COMING_SOON && !isComingSoonExemptPath(pathname);

  return (
    <main
      id="main-content"
      className={cn(
        "min-h-screen bg-background",
        comingSoonBlur && "blur-md pointer-events-none select-none"
      )}
    >
      {children}
    </main>
  );
}

export default MainContent;