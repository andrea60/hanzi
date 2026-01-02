import { WordPracticeResult } from "../../practice-session/usePracticeSession";
import { db, WordStatRow } from "../database.db";

export const updateWordStats = async (
  userId: string,
  wordStats: WordPracticeResult[],
  sessionTime: Date
) => {
  const currentStats = await db.wordSkillStatsV3
    .where("userId")
    .equals(userId)
    .toArray();

  const newStats: WordStatRow[] = [];
  for (const sessionWordStats of wordStats) {
    const statRow = currentStats.find(
      (stat) =>
        stat.word === sessionWordStats.word &&
        stat.skill === sessionWordStats.objective
    );

    const newRow = statRow
      ? { ...statRow }
      : {
          userId,
          word: sessionWordStats.word,
          skill: sessionWordStats.objective,
          failures: 0,
          partialSuccesses: 0,
          successes: 0,
          totalCount: 0,
          lastPracticedAt: sessionTime,
        };

    newRow.totalCount++;
    switch (sessionWordStats.result) {
      case "failure":
      case "skipped":
        newRow.failures++;
        break;
      case "partial-success":
        newRow.partialSuccesses++;
        break;
      case "success":
        newRow.successes++;
        break;
    }

    newStats.push(newRow);
  }

  await db.wordSkillStatsV3.bulkPut(newStats);
};
