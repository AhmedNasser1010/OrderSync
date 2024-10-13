import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSetOrderWorkflowSettingsMutation, useFetchUserDataQuery, useFetchRestaurantDataQuery } from '@/lib/rtk/api/firestoreApi'
import { useAppSelector } from "@/lib/rtk/hooks";
import { userUid } from '@/lib/rtk/slices/constantsSlice'
import React from "react";

export default function OrderWorkflow() {
  const uid = useAppSelector(userUid)
  const { data: userData } = useFetchUserDataQuery(uid)
  const { data: resData } = useFetchRestaurantDataQuery(userData?.accessToken)
  const driverAssignFeatureValue = resData?.settings?.orderManagement?.assign?.forDeliveryWorkers || false
  const [setOrderWorkflowSettings] = useSetOrderWorkflowSettingsMutation()

  const handleDriverAssignFeature = (checked: boolean) => {
    setOrderWorkflowSettings({ resId: userData?.accessToken, settingName: "assign.forDeliveryWorkers", value: checked })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Workflow Customization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="rider-tracking">Driver Assign Feature</Label>
          <Switch id="rider-tracking" defaultChecked={driverAssignFeatureValue} onCheckedChange={handleDriverAssignFeature} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="hold-resume">Hold/Resume Orders</Label>
          <Switch id="hold-resume" defaultChecked={false} disabled={true} />
        </div>
      </CardContent>
    </Card>
  );
}
