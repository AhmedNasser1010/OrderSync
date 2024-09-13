import { useAppSelector, useAppDispatch } from "@/lib/rtk/hooks";
import { resStatus, setResStatus } from "@/lib/rtk/slices/toggleSlice";

type UserStatus = "active" | "inactive" | "busy";

const useResStatus = () => {
  const dispatch = useAppDispatch();
  const resStatusValue = useAppSelector(resStatus);

  const toggleResStatus = () => {
    const statusOrder: UserStatus[] = ["active", "inactive", "busy"];
    const currentIndex = statusOrder.indexOf(resStatusValue);
    const newIndex = (currentIndex + 1) % statusOrder.length;
    dispatch(setResStatus(statusOrder[newIndex]));
  };

  return toggleResStatus;
};

export default useResStatus;
