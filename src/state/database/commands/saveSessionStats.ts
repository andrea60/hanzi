import { toMap } from "../../../utils/toMap";
import { WordPracticeResult } from "../../practice-session/usePracticeSession";
import { db, WordStatRow } from "../database.db";

export const saveSessionStats = async (
  id: string,
  timestamp: Date,
  timeTakenSeconds: number,
  words: string[],
  userId: string
) => {
  // Register general session
  await db.sessions.add({
    id,
    timestamp,
    words,
    userId,
    timeTakenSeconds,
  });
};
