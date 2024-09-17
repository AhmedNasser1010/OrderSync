"use client";

import { Button } from "@/components/ui/button";
import { Loader2, CirclePower } from "lucide-react";
import useResStatus from "@/hooks/useResStatus";

function ResStatusBtn() {
  const { toggleResStatus, isLoading, isAvailableFeature } = useResStatus();

  return isAvailableFeature && (
    <Button
      onClick={toggleResStatus}
      variant="outline"
      disabled={isLoading}
      className="min-w-[105px]"
      size='sm'
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Toggle
        </>
      ) : (
        <>
          <CirclePower className="mr-2 h-4 w-4" />
          Status
        </>
      )}
    </Button>
  );
}

export default ResStatusBtn;
