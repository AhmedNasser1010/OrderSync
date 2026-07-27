import { useEffect } from "react";

const DEFAULT_TITLE = "Orders";

export default function useDocumentTitle(receivedCount: number) {
  useEffect(() => {
    if (receivedCount > 0) {
      document.title = `(${receivedCount}) New Orders - ${DEFAULT_TITLE}`;
    } else {
      document.title = DEFAULT_TITLE;
    }

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [receivedCount]);
}
