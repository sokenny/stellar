function calculateSignificance(data) {
  // Extract data for the control and variant
  const variantA = data[0];
  const variantB = data[1];

  // Control data
  const nA = variantA.unique_visitors;
  const xA = variantA.conversions;
  const crA = variantA.conversionRate / 100;

  // Variant data
  const nB = variantB.unique_visitors;
  const xB = variantB.conversions;
  const crB = variantB.conversionRate / 100;

  // Pooled conversion rate
  const pPool = (xA + xB) / (nA + nB);

  // Standard error
  const standardError = Math.sqrt(pPool * (1 - pPool) * (1 / nA + 1 / nB));

  // Z-score calculation
  const zScore = (crB - crA) / standardError;

  // Two-tailed p-value calculation
  const pValue = 2 * (1 - cumulativeProbability(Math.abs(zScore)));

  // Calculate significance as a percentage
  const significance = (1 - pValue) * 100;

  return Math.round(significance * 100) / 100; // Rounded to 2 decimal places
}

// Helper function to calculate cumulative probability for normal distribution
function cumulativeProbability(z) {
  return 0.5 * (1 + erf(z / Math.sqrt(2)));
}

// Approximation of the error function (erf) using a numerical approximation
function erf(x) {
  // Coefficients for the approximation
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  // Save the sign of x
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  // Approximation of the error function
  const t = 1 / (1 + p * x);
  const y =
    1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

export default calculateSignificance;
