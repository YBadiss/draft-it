export const groupBy = (array, keyFn) => {
  return array.reduce(function(accumulator, value) {
    const key = keyFn(value);
    (accumulator[key] = accumulator[key] || []).push(value);
    return accumulator;
  }, {});
};

export const formatAmount = (amount) => {
  const divider = amount >= 1_000_000 ? 1_000_000 : 100_000;
  const unit = amount >= 1_000_000 ? "M" : "k";
  const roundedAmount =  (amount / divider).toFixed(amount % divider > 0 ? 1 : 0);
  return `${roundedAmount}${unit}`;
};
