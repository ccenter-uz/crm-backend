/**
 * Utility function to convert Unix timestamp string back to Date
 * @param timestamp Unix timestamp string
 * @returns Date object
 */
export function unixTimestampToDate(timestamp: string): Date {
  return new Date(parseInt(timestamp) * 1000);
}
