import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSetDisplaySettingsMutation, useFetchUserDataQuery, useFetchRestaurantDataQuery } from '@/rtk/api/firestoreApi'
import { useAppSelector } from "@/rtk/hooks";
import { userUid } from '@/rtk/slices/constantsSlice'

export default function DisplaySettings() {
  const uid = useAppSelector(userUid)
  const { data: userData } = useFetchUserDataQuery(uid)
  const { data: resData } = useFetchRestaurantDataQuery(userData?.accessToken)
  const [setDisplaySettings] = useSetDisplaySettingsMutation()

  const handleOnBlur = (e: any) => {
    setDisplaySettings({
      resId: userData?.accessToken,
      settingName: e.target.name,
      value: e.target.value
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Display Settings</CardTitle>
        <CardDescription>
          Manage your restaurant&apos;s icon, cover, and promotional subtitles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-1.5 mb-4">
          <Label htmlFor="promotional-subtitle">Promotional Subtitle</Label>
          <Input id="promotional-subtitle" type="text" defaultValue={resData?.business?.promotionalSubtitle} name="promotionalSubtitle" onBlur={handleOnBlur} />
        </div>
        <div className="grid w-full items-center gap-1.5 mb-4">
          <Label htmlFor="brand-logo">Brand Logo URL</Label>
          <Input id="brand-logo" type="text" defaultValue={resData?.business?.icon} name="icon" onBlur={handleOnBlur} />
        </div>
        <div className="grid w-full items-center gap-1.5 mb-4">
          <Label htmlFor="brand-cover">Brand Cover URL</Label>
          <Input id="brand-cover" type="text" name="cover" defaultValue={resData?.business?.cover} onBlur={handleOnBlur} />
        </div>
        <div className="grid w-full gap-1.5">
          <Label htmlFor="message">Temporary Pause Close Message</Label>
          <Textarea placeholder="Type your message here." id="message" defaultValue={resData?.settings?.siteControl?.closeMsg} name="closeMsg" onBlur={handleOnBlur} />
        </div>
      </CardContent>
    </Card>
  );
}
