import { db } from "../database.db";

export const saveSessionStats = async (
  id: string,
  timestamp: Date,
  timeTakenSeconds: number,
  avgAccuracy: number,
  words: string[],
  userId: string
) => {
  await db.sessions.add({
    id,
    timestamp,
    avgAccuracy,
    words,
    userId,
    timeTakenSeconds,
  });
};
