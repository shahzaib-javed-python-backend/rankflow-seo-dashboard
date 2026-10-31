/**
 * Statistical utilities for rank volatility & anomaly detection.
 *
 * A keyword is flagged as an anomaly when its current rank drops
 * more than 2 standard deviations below its 14-day moving average.
 */

export function mean(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

export function stdDev(nums: number[]): number {
  if (nums.length < 2) return 0;
  const m = mean(nums);
  const variance = nums.reduce((s, n) => s + (n - m) ** 2, 0) / (nums.length - 1);
  return Math.sqrt(variance);
}

/**
 * Moving average over the last `window` data points.
 */
export function movingAverage(data: number[], window: number): number {
  if (!data.length) return 0;
  const slice = data.slice(-window);
  return mean(slice);
}

export interface AnomalyResult {
  zScore: number;
  isAnomaly: boolean;
  movingAvg: number;
  std: number;
}

/**
 * Calculate the Z-score of a current rank against a 14-day history.
 *
 * Rank data is "lower is better," so a positive Z-score means the
 * current rank number is higher than average (i.e. a drop in position).
 * Anomaly threshold: Z > 2 (rank is >2 std devs above the moving average).
 */
export function detectAnomaly(history: number[], currentRank: number): AnomalyResult {
  const window = 14;
  const ma = movingAverage(history, window);
  const std = stdDev(history.slice(-window));
  const z = std > 0 ? (currentRank - ma) / std : 0;
  return {
    zScore: +z.toFixed(2),
    isAnomaly: z > 2,
    movingAvg: +ma.toFixed(1),
    std: +std.toFixed(2),
  };
}
