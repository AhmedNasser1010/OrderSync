import React from 'react'
import { Button } from "@/components/ui/button"

type UserStatus = "active" | "inactive" | "busy"

type UserStatusIndicatorProps = {
  userStatus: UserStatus
  toggleUserStatus: () => void
}

const getStatusColor = (status: UserStatus) => {
  switch (status) {
    case "active":
      return "bg-green-500"
    case "inactive":
      return "bg-gray-500"
    case "busy":
      return "bg-yellow-500"
    default:
      return "bg-gray-500"
  }
}

const UserStatusIndicator: React.FC<UserStatusIndicatorProps> = ({ userStatus, toggleUserStatus }) => {
  return (
    <div className="flex items-center space-x-2">
      <div
        className={`w-3 h-3 rounded-full ${getStatusColor(userStatus)}`}
        title={`Status: ${userStatus}`}
      />
      <span className="text-sm font-medium capitalize">{userStatus}</span>
      <Button
        onClick={toggleUserStatus}
        variant="outline"
      >
        Toggle Status
      </Button>
    </div>
  )
}

export default UserStatusIndicator
