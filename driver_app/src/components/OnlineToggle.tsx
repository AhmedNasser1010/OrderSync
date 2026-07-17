"use client";

import { useToggleOnlineStatusMutation } from "@/rtk/api/firestoreApi";
import { useAppSelector } from "@/rtk/hooks";
import { selectUser } from "@/rtk/slices/authSlice";

interface OnlineToggleProps {
  byManager: boolean;
  byUser: boolean;
}

export function OnlineToggle({ byManager, byUser }: OnlineToggleProps) {
  const authUser = useAppSelector(selectUser);
  const driverUid = authUser?.uid ?? "";
  const [toggleOnline, { isLoading }] = useToggleOnlineStatusMutation();

  const isOnline = byManager && byUser;
  const canToggle = byManager;

  const handleToggle = async () => {
    if (!driverUid || !canToggle || isLoading) return;
    await toggleOnline({ uid: driverUid, byUser: !byUser });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={!canToggle || isLoading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        isOnline
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500"
      } ${!canToggle ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          isOnline ? "bg-green-500" : "bg-gray-400"
        }`}
      />
      {isOnline ? "Online" : "Offline"}
    </button>
  );
}
