import { WordPracticeStats } from "../../practice-session/usePracticeSession";
import { db, WordStatRow } from "../database.db";

export const updateWordStats = async (
  userId: string,
  wordStats: WordPracticeStats[],
  sessionTime: Date
) => {
  const currentStats = await db.wordStats
    .where("userId")
    .equals(userId)
    .toArray();

  const newStats: WordStatRow[] = [];
  for (const sessionWordStats of wordStats) {
    const statRow = currentStats.find(
      (stat) => stat.word === sessionWordStats.word
    );

    if (statRow)
      newStats.push({
        ...statRow,
        practiceCount: statRow.practiceCount + 1,
        lastPracticed: sessionTime,
        avgAccuracy:
          (statRow.avgAccuracy * statRow.practiceCount +
            sessionWordStats.accuracy) /
          (statRow.practiceCount + 1),
      });
    else
      newStats.push({
        word: sessionWordStats.word,
        userId,
        practiceCount: 1,
        lastPracticed: sessionTime,
        avgAccuracy: sessionWordStats.accuracy,
      });
  }

  await db.wordStats.bulkPut(newStats);
};
