"use client";

import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/lib/rtk/hooks";
import { resStatus } from "@/lib/rtk/slices/toggleSlice";
import useResStatus from "@/hooks/useResStatus";

type UserStatus = "active" | "inactive" | "busy";

const getStatusColor = (status: UserStatus) => {
  switch (status) {
    case "active":
      return "bg-green-500";
    case "inactive":
      return "bg-gray-500";
    case "busy":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};

function UserStatusIndicator() {
  const resStatusValue = useAppSelector(resStatus);
  const toggleResStatus = useResStatus();

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`w-3 h-3 rounded-full ${getStatusColor(resStatusValue)}`}
        title={`Status: ${resStatusValue}`}
      />
      <span className="text-sm font-medium capitalize">{resStatusValue}</span>
      <Button onClick={toggleResStatus} variant="outline">
        Toggle Status
      </Button>
    </div>
  );
}

export default UserStatusIndicator;
