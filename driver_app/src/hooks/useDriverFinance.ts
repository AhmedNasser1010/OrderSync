import useUser from "./useUser";

type DriverFinanceResult = {
  currentCash: number;
  dailyAdvance: number;
  earnings: number;
  isLoading: boolean;
};

export default function useDriverFinance(): DriverFinanceResult {
  const { userData, isLoading } = useUser();
  const finance = userData?.finance;

  if (!finance || isLoading) {
    return {
      currentCash: 0,
      dailyAdvance: 0,
      earnings: 0,
      isLoading: true,
    };
  }

  return {
    currentCash: finance.currentCash,
    dailyAdvance: finance.dailyAdvance,
    earnings: finance.earnings,
    isLoading: false,
  };
}
