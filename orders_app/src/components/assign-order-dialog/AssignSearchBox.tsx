import { useCallback, useState } from "react";
import { Search, Loader2, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormattedDriverForAssignCard } from "@/types/components";

type Props = {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setSelectedDriver: React.Dispatch<React.SetStateAction<string | null>>;
  drivers: FormattedDriverForAssignCard[];
};

export default function AssignSearchBox({
  searchTerm,
  setSearchTerm,
  setSelectedDriver,
  drivers,
}: Props) {
  const [isAutoPilot, setIsAutoPilot] = useState(false);

  const handleAutoPilot = useCallback(() => {
    setIsAutoPilot(true);
    setTimeout(() => {
      const availableDrivers = drivers.filter((d) => d.status === "Available");
      if (availableDrivers.length > 0) {
        const randomDriver =
          availableDrivers[Math.floor(Math.random() * availableDrivers.length)];
        setSelectedDriver(randomDriver.id);
      }
      setIsAutoPilot(false);
    }, 1500);
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search drivers..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={handleAutoPilot}
        disabled={isAutoPilot}
      >
        {isAutoPilot ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Zap className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
