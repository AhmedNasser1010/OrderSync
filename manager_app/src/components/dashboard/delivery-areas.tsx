"use client";

import { useTranslations } from "next-intl";
import { DeliveryArea } from "@/lib/types/types";
import { MapPin } from "lucide-react";
import { WidgetHelp } from "@/components/ui/widget-help";

interface DeliveryAreasProps {
  areas: DeliveryArea[];
}

export function DeliveryAreas({ areas }: DeliveryAreasProps) {
  const t = useTranslations("Dashboard.deliveryAreas");

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-card-foreground flex items-center gap-1">
          {t("title")}
          <WidgetHelp widgetKey="deliveryAreas" />
        </h3>
        <button className="text-xs font-medium px-2.5 py-1 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
          {t("viewMap")}
        </button>
      </div>

      <div className="space-y-3">
        {areas.map((area, idx) => (
          <div
            key={idx}
            className="flex items-start justify-between py-2 border-b border-border last:border-0"
          >
            <div className="flex items-start gap-2 flex-1">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-card-foreground">
                  {area.location}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-card-foreground">
                {area.orders}
              </p>
              <p className="text-xs text-muted-foreground">
                {area.percentage}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
