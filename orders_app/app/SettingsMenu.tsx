import React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

type SettingsMenuProps = {
  closeDay: () => void
  generateReport: () => void
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ closeDay, generateReport }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Open settings menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <Button onClick={closeDay}>Close the Day</Button>
          <Button onClick={generateReport}>Generate Report</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default SettingsMenu
