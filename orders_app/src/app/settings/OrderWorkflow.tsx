import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSetOrderWorkflowSettingsMutation, useFetchUserDataQuery, useFetchRestaurantDataQuery } from '@/rtk/api/firestoreApi'
import { useAppSelector } from "@/rtk/hooks";
import { userUid } from '@/rtk/slices/constantsSlice'
import React from "react";

export default function OrderWorkflow() {
  const uid = useAppSelector(userUid)
  const { data: userData } = useFetchUserDataQuery(uid)
  const { data: resData } = useFetchRestaurantDataQuery(userData?.accessToken)
  const driverAssignment = resData?.settings?.orderManagement?.driverAssignment ?? false;
  const printInvoice = resData?.settings?.orderManagement?.printInvoice ?? false;
  const [setOrderWorkflowSettings] = useSetOrderWorkflowSettingsMutation()

  const handleDriverAssignment = (checked: boolean) => {
    setOrderWorkflowSettings({ resId: userData?.accessToken, settingName: "driverAssignment", value: checked })
  }

  const handlePrintInvoice = (checked: boolean) => {
    setOrderWorkflowSettings({ resId: userData?.accessToken, settingName: "printInvoice", value: checked })
  }

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle>Order Workflow Customization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="rider-tracking">Driver Assign Feature</Label>
          <Switch id="rider-tracking" defaultChecked={driverAssignment} onCheckedChange={handleDriverAssignment} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="print-invoice">Print Invoice</Label>
          <Switch id="print-invoice" defaultChecked={printInvoice} onCheckedChange={handlePrintInvoice} />
        </div>
      </CardContent>
    </Card>
  );
}
