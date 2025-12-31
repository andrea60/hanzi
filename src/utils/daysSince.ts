export const daysSince = (timestamp: Date, now: Date) =>
  (now.valueOf() - timestamp.valueOf()) / (1000 * 60 * 60 * 24);
