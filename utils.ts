export interface CashFlowItem {
  period: number;
  paymentDate: string;
  couponPayment: number;
  cumulativeInterest: number;
  remainingPrincipal: number;
}

// ----------------------------
// Current Yield
// ----------------------------
export const calculateCurrentYield = (
  faceValue: number,
  couponRate: number,
  marketPrice: number
): number => {
  if (!faceValue || !couponRate || !marketPrice) return 0;

  const annualCoupon = faceValue * (couponRate / 100);
  return annualCoupon / marketPrice;
};

// ----------------------------
// Total Interest
// ----------------------------
export const calculateTotalInterest = (
  faceValue: number,
  couponRate: number,
  years: number,
  frequency: number
): number => {
  if (!faceValue || !couponRate || !years || !frequency) return 0;

  const totalPeriods = years * frequency;
  const coupon = (faceValue * couponRate) / 100 / frequency;

  return coupon * totalPeriods;
};

// ----------------------------
// Yield to Maturity (YTM) using Binary Search
// ----------------------------
export const calculateYTM = (
  faceValue: number,
  marketPrice: number,
  couponRate: number,
  years: number,
  frequency: number
): number => {
  if (!faceValue || !marketPrice || !years || !frequency) return 0;

  const periods = years * frequency;
  const coupon = (faceValue * couponRate) / 100 / frequency;

  let low = 0;
  let high = 1;
  let mid = 0;

  for (let i = 0; i < 100; i++) {
    mid = (low + high) / 2;

    let price = 0;

    for (let t = 1; t <= periods; t++) {
      price += coupon / Math.pow(1 + mid, t);
    }

    price += faceValue / Math.pow(1 + mid, periods);

    if (price > marketPrice) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return mid * frequency * 100;
};

// ----------------------------
// Cash Flow Generation
// ----------------------------
export const generateCashFlow = (
  faceValue: number,
  couponRate: number,
  years: number,
  frequency: number
): CashFlowItem[] => {
  if (!faceValue || !couponRate || !years || !frequency) return [];

  const periods = years * frequency;
  const coupon = (faceValue * couponRate) / 100 / frequency;

  let cumulativeInterest = 0;
  const today = new Date();

  return Array.from({ length: periods }).map((_, i) => {
    cumulativeInterest += coupon;

    const paymentDate = new Date(today);
    paymentDate.setMonth(
      paymentDate.getMonth() + (i + 1) * (12 / frequency)
    );

    return {
      period: i + 1,
      paymentDate: paymentDate.toLocaleDateString(),
      couponPayment: coupon,
      cumulativeInterest,
      remainingPrincipal: i === periods - 1 ? 0 : faceValue,
    };
  });
};

// ----------------------------
// Formatters
// ----------------------------
export const formatCurrency = (num: number): string => {
  if (num === undefined || num === null) return "$0.00";
  return `$${num.toFixed(2)}`;
};

export const formatPercent = (num: number): string => {
  if (num === undefined || num === null) return "0.00%";
  return `${(num * 100).toFixed(2)}%`;
};