export const MINIMUM_MONTHLY_CENTS = 2500;

export const computeDurationInMonths = (priceInCents: number): number => {
  const normalizedPrice = Math.max(priceInCents, MINIMUM_MONTHLY_CENTS);
  const estimatedMonths = Math.ceil(normalizedPrice / 15000);
  return Math.min(12, Math.max(4, estimatedMonths));
};

export const deriveMonthlyAmount = (priceInCents: number): number =>
  Math.max(Math.round(priceInCents), 0);
