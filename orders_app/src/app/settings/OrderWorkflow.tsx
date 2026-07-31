"use client";

import { useTranslations } from "next-intl";
import { Printer, Zap } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useSetOrderWorkflowSettingsMutation,
  useFetchUserDataQuery,
  useFetchRestaurantDataQuery,
} from "@/rtk/api/firestoreApi";
import { useAppSelector } from "@/rtk/hooks";
import { userUid } from "@/rtk/slices/constantsSlice";
import { skipToken } from "@reduxjs/toolkit/query";

export default function OrderWorkflow() {
  const t = useTranslations("Settings.workflow");
  const uid = useAppSelector(userUid);
  const { data: userData } = useFetchUserDataQuery(uid ? uid : skipToken);
  const { data: resData } = useFetchRestaurantDataQuery(
    userData?.accessToken ?? skipToken,
    {
      skip: !userData?.accessToken,
    },
  );
  const printInvoice = resData?.settings?.printInvoice ?? false;
  const skipAccepted = resData?.settings?.skipAccepted ?? false;
  const [setOrderWorkflowSettings] = useSetOrderWorkflowSettingsMutation();

  const handlePrintInvoice = (checked: boolean) => {
    setOrderWorkflowSettings({
      resId: userData?.accessToken,
      settingName: "printInvoice",
      value: checked,
    });
  };

  const handleSkipAccepted = (checked: boolean) => {
    setOrderWorkflowSettings({
      resId: userData?.accessToken,
      settingName: "skipAccepted",
      value: checked,
    });
  };

  return (
    <section className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 shrink-0">
          <Printer className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-foreground">{t("title")}</h2>
          <p className="text-xs text-muted-foreground">{t("description")}</p>
        </div>
      </div>
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center justify-between py-3 border-t border-border">
          <Label htmlFor="print-invoice" className="text-sm text-foreground">{t("printInvoice")}</Label>
          <Switch
            id="print-invoice"
            defaultChecked={printInvoice}
            onCheckedChange={handlePrintInvoice}
          />
        </div>
        <div className="flex items-center justify-between gap-3 py-3 border-t border-border">
          <div className="min-w-0">
            <Label htmlFor="skip-accepted" className="text-sm text-foreground">
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-orange-500" />
                {t("skipAccepted")}
              </span>
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">{t("skipAcceptedDesc")}</p>
          </div>
          <Switch
            id="skip-accepted"
            defaultChecked={skipAccepted}
            onCheckedChange={handleSkipAccepted}
          />
        </div>
      </div>
    </section>
  );
}
