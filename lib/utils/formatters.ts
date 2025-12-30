/**
 * Format a number of days into a human-readable string
 * @param days - Number of days
 * @returns Formatted string (e.g., "3 days ago", "1 day ago", "today")
 */
export function formatDaysAgo(days: number): string {
  if (days === 0) {
    return 'today';
  } else if (days === 1) {
    return '1 day ago';
  } else if (days < 30) {
    return `${days} days ago`;
  } else if (days < 60) {
    return '1 month ago';
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} months ago`;
  } else {
    const years = Math.floor(days / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
}

/**
 * Format a date into a readable string
 * @param date - Date object or ISO string
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a percentage value
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string (e.g., "85%")
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a large number with abbreviations
 * @param num - Number to format
 * @returns Formatted number string (e.g., "1.2K", "3.4M")
 */
export function formatNumber(num: number): string {
  if (num < 1000) {
    return num.toString();
  } else if (num < 1000000) {
    return `${(num / 1000).toFixed(1)}K`;
  } else {
    return `${(num / 1000000).toFixed(1)}M`;
  }
}

/**
 * Format code churn metric
 * @param additions - Lines added
 * @param deletions - Lines deleted
 * @returns Formatted string (e.g., "+123 / -45")
 */
export function formatCodeChurn(additions: number, deletions: number): string {
  return `+${formatNumber(additions)} / -${formatNumber(deletions)}`;
}
