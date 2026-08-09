/**
 * Format a Date object as a string in the format 'YYYY-MM-DD'
 * @param data The Date object to format
 */
export function toDateOnlyString(data: Date): string {
  const year = data.getFullYear();
  const month = String(data.getMonth() + 1).padStart(2, '0');
  const day = String(data.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
