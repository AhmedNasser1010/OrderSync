import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Themes() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance and Themes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="dark-mode">Dark Mode</Label>
          <Switch
            id="dark-mode"
            checked={isDarkMode}
            onCheckedChange={setIsDarkMode}
            disabled={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}
