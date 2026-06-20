import { formatDistanceToNow, differenceInHours, format } from "date-fns";

/**
 * Formats a date to a compact relative time representation (e.g., "1 min ago", "2 hrs ago", "Jun 16").
 */
export function formatCompactTimeAgo(dateInput: Date | string | number): string {
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";

    if (differenceInHours(new Date(), date) >= 24) {
      return format(date, "MMM d");
    }

    const timeAgoRaw = formatDistanceToNow(date, { addSuffix: true });
    return timeAgoRaw
      .replace("about ", "")
      .replace("less than a minute", "1 min")
      .replace("minutes", "min")
      .replace("minute", "min")
      .replace("hours", "hrs")
      .replace("hour", "hr");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}
