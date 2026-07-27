import { Palette } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useSetDisplaySettingsMutation,
  useFetchUserDataQuery,
  useFetchRestaurantDataQuery,
} from "@/rtk/api/firestoreApi";
import { useAppSelector } from "@/rtk/hooks";
import { userUid } from "@/rtk/slices/constantsSlice";
import { skipToken } from "@reduxjs/toolkit/query";

export default function DisplaySettings() {
  const uid = useAppSelector(userUid);
  const { data: userData } = useFetchUserDataQuery(uid ? uid : skipToken);
  const { data: resData } = useFetchRestaurantDataQuery(
    userData?.accessToken ?? skipToken,
    {
      skip: !userData?.accessToken,
    },
  );
  const [setDisplaySettings] = useSetDisplaySettingsMutation();

  const handleOnBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setDisplaySettings({
      resId: userData?.accessToken,
      settingName: e.target.name,
      value: e.target.value,
    });
  };

  return (
    <section className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
          <Palette className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-foreground">Display Settings</h2>
          <p className="text-xs text-muted-foreground">Manage your brand icon, cover & subtitles</p>
        </div>
      </div>
      <div className="px-4 pb-4 pt-2 space-y-0">
        <div className="flex flex-col gap-1.5 py-3 border-t border-border">
          <Label htmlFor="promotional-subtitle" className="text-sm text-foreground">Promotional Subtitle</Label>
          <Input
            id="promotional-subtitle"
            type="text"
            defaultValue={resData?.branding?.promotionalSubtitle}
            name="promotionalSubtitle"
            onBlur={handleOnBlur}
            className="h-9 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5 py-3 border-t border-border">
          <Label htmlFor="brand-logo" className="text-sm text-foreground">Brand Logo URL</Label>
          <Input
            id="brand-logo"
            type="text"
            defaultValue={resData?.branding?.icon}
            name="icon"
            onBlur={handleOnBlur}
            className="h-9 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5 py-3 border-t border-border">
          <Label htmlFor="brand-cover" className="text-sm text-foreground">Brand Cover URL</Label>
          <Input
            id="brand-cover"
            type="text"
            name="cover"
            defaultValue={resData?.branding?.cover}
            onBlur={handleOnBlur}
            className="h-9 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5 py-3 border-t border-border">
          <Label htmlFor="message" className="text-sm text-foreground">Temporary Pause Message</Label>
          <Textarea
            placeholder="Type your message here."
            id="message"
            defaultValue={resData?.branding?.closeMsg}
            name="closeMsg"
            onBlur={handleOnBlur}
            className="text-sm min-h-[80px] resize-none"
          />
        </div>
      </div>
    </section>
  );
}
