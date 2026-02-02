import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/ui/ModeToggle";

export default function Themes() {
  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle>Appearance and Themes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="dark-mode">Dark Mode</Label>
          <ModeToggle />
        </div>
      </CardContent>
    </Card>
  );
}
