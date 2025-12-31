import { toMap } from "../../../utils/toMap";
import { WordPracticeResult } from "../../practice-session/usePracticeSession";
import { db, WordStatRow } from "../database.db";

export const saveSessionStats = async (
  id: string,
  timestamp: Date,
  timeTakenSeconds: number,
  words: string[],
  userId: string,
  results: WordPracticeResult[]
) => {
  const now = new Date();

  // Register general session
  await db.sessions.add({
    id,
    timestamp,
    words,
    userId,
    timeTakenSeconds,
  });

  // Update word stats
  const currentWordStats = toMap(
    await db.wordSkillStats
      .where("[word+userId]")
      .anyOf(words.map((word) => [word, userId]))
      .toArray(),
    (r) => r.skill + "-" + r.word
  );

  const newWordStats: WordStatRow[] = [];
  for (const result of results) {
    const prevStats = currentWordStats.get(
      result.objective + "-" + result.word
    );

    if (!prevStats)
      newWordStats.push({
        word: result.word,
        skill: result.objective,
        userId,
        attempts: result.attempts,
        failures: result.failures,
        skips: result.skips,
        avgTimeMs: result.timeTakenMs,
        lastPracticedAt: now,
      });
    else
      newWordStats.push({
        ...prevStats,
        attempts: prevStats.attempts + result.attempts,
        failures: prevStats.failures + result.failures,
        skips: prevStats.skips + result.skips,
        avgTimeMs: (prevStats.avgTimeMs + result.timeTakenMs) / 2,
        lastPracticedAt: now,
      });
  }

  // Upsert all word stats atomically
  await db.wordSkillStats.bulkPut(newWordStats);
};
