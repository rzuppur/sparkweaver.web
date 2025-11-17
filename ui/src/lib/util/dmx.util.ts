/**
 * @description Convert DMX frames to seconds at 41.67 frames per second.
 * @param ticks
 */
export function estimateTime(ticks: number): string {
  const seconds = ticks / 41.67;
  const minutes = seconds / 60;
  if (minutes > 2) {
    return `${minutes.toFixed(2)}m`;
  }
  return `${seconds.toFixed(2)}s`;
}
