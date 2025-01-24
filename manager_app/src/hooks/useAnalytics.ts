import {
  useFetchOrdersDailySummarizationDataQuery,
  useFetchUserDataQuery,
} from "@/lib/rtk/api/firestoreApi";
import { useAppSelector } from "@/lib/rtk/hooks";
import { userUid } from "@/lib/rtk/slices/constantsSlice";
import { useEffect, useState } from "react";
import { AnalyticsEntry } from "@/types/AnalyticsEntry";
import { timeRange } from "@/lib/rtk/slices/toggleSlice";
import filterDataByDateRange from "@/utilities/filterDataByDateRange";

const useAnalytics = () => {
  const uid = useAppSelector(userUid);
  const { data: user } = useFetchUserDataQuery(uid);
  const resId = user?.accessToken;
  const { data: dailySummarizationData } =
    useFetchOrdersDailySummarizationDataQuery(resId);
  const timeRangeValue = useAppSelector(timeRange);
  const [data, setData] = useState<AnalyticsEntry[]>([]);

  useEffect(() => {
    if (timeRangeValue && dailySummarizationData) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(timeRangeValue));
      const finalStartDate = startDate.toISOString().split("T")[0];
      const endDate = new Date().toISOString().split("T")[0];
      const filteredData = filterDataByDateRange(
        finalStartDate,
        endDate,
        "date",
        dailySummarizationData
      );
      setData(filteredData);
    }
  }, [timeRangeValue, dailySummarizationData]);

  return {
    data,
  };
};

export default useAnalytics;
