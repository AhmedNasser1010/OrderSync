"use client";

import { RestaurantStatusTypes } from "@/types/restaurant";
import useResStatus from "@/hooks/useResStatus";

const getStatusColor = (status: RestaurantStatusTypes) => {
  switch (status) {
    case "active":
      return "bg-green-500";
    case "inactive":
      return "bg-gray-500";
    case "busy":
      return "bg-yellow-500";
    case "pause":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

function ResStatus() {
  const { currentStatus } = useResStatus();

  return (
    <div className="flex items-center space-x-1">
      <div
        className={`w-3 h-3 rounded-full ${getStatusColor(currentStatus)}`}
        title={`Status: ${currentStatus}`}
      />
      <span className="text-sm font-medium capitalize">{currentStatus}</span>
    </div>
  );
}

export default ResStatus;
