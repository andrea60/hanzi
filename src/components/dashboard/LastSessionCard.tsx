import { match, P } from "ts-pattern";
import { useSessionsHistory } from "../../state/database/queries/useSessionsHistory";
import {
  CalendarDateRangeIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";

export const LastSessionCard = () => {
  const { data } = useSessionsHistory(1);
  const skeleton = (
    <div className="h-10 flex items-center">
      <div className="skeleton w-20 h-4" />
    </div>
  );

  const noPrevSession = (
    <h1 className="text-center">No previous session recorded</h1>
  );

  const content = match(data)
    .with(undefined, () => skeleton)
    .when(
      (d) => d.length === 0,
      () => noPrevSession
    )
    .otherwise(([session]) => (
      <span className="text-2xl">{formatRelativeDate(session.timestamp)}</span>
    ));

  return (
    <div className="card card-default card-sm">
      <div className="card-body">
        <h1>Last Session</h1>
        <div className="flex items-center gap-2 justify-between">
          {content}
          <CalendarDaysIcon className="size-8" />
        </div>
      </div>
    </div>
  );
};

/**
 * Compare input date with today and return a human-readable description.
 *
 * @param inputDate - The date to compare.
 * @returns "Today", "Yesterday", or "X days ago"
 */
export function formatRelativeDate(inputDate: Date): string {
  const today = new Date();

  // Normalize both dates to ignore time (set to midnight)
  const normalize = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const input = normalize(inputDate);
  const current = normalize(today);

  // Calculate the difference in days
  const msInDay = 1000 * 60 * 60 * 24;
  const daysDiff = Math.round((current.getTime() - input.getTime()) / msInDay);

  return match(daysDiff)
    .with(0, () => "Today")
    .with(1, () => "Yesterday")
    .otherwise(() => `${daysDiff} days ago`);
}
