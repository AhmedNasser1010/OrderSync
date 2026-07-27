"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProfileAndLang() {
  const t = useTranslations("Settings.profile");
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (value: string) => {
    router.replace(pathname, { locale: value });
  };

  return (
    <section className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
          <Globe className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-foreground">{t("title")}</h2>
          <p className="text-xs text-muted-foreground">{t("description")}</p>
        </div>
      </div>
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center justify-between py-3 border-t border-border">
          <Label htmlFor="language" className="text-sm text-foreground">{t("language")}</Label>
          <Select value={currentLocale} onValueChange={handleLanguageChange}>
            <SelectTrigger id="language" className="w-auto h-9 text-sm">
              <SelectValue placeholder={t("selectLanguage")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">العربية</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}
