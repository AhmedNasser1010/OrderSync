import useUser from "./useUser";

type DriverFinanceResult = {
  currentCash: number;
  warningLimit: number;
  blockLimit: number;
  isWarning: boolean;
  isBlocked: boolean;
  isLoading: boolean;
};

export default function useDriverFinance(): DriverFinanceResult {
  const { userData, isLoading } = useUser();
  const finance = userData?.finance;

  if (!finance || isLoading) {
    return {
      currentCash: 0,
      warningLimit: 0,
      blockLimit: 0,
      isWarning: false,
      isBlocked: false,
      isLoading: true,
    };
  }

  const isBlocked = finance.currentCash >= finance.blockLimit;
  const isWarning = !isBlocked && finance.currentCash >= finance.warningLimit;

  return {
    currentCash: finance.currentCash,
    warningLimit: finance.warningLimit,
    blockLimit: finance.blockLimit,
    isWarning,
    isBlocked,
    isLoading: false,
  };
}
