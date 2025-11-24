export const MINIMUM_MONTHLY_CENTS = 2500;

export const calculateDiscountRate = (courseCount: number): number => {
  if (courseCount >= 5) return 0.15;
  if (courseCount >= 3) return 0.1;
  return 0;
};

export const computeDurationInMonths = (priceInCents: number): number => {
  const normalizedPrice = Math.max(priceInCents, MINIMUM_MONTHLY_CENTS);
  const estimatedMonths = Math.ceil(normalizedPrice / 15000);
  return Math.min(12, Math.max(4, estimatedMonths));
};

export const deriveMonthlyAmount = (priceInCents: number): number => {
  const duration = computeDurationInMonths(priceInCents);
  return Math.max(Math.round(priceInCents / duration), MINIMUM_MONTHLY_CENTS);
};
