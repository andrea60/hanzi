import { match } from "ts-pattern";
import { toMap } from "../../utils/toMap";
import { db, WordStatRow } from "../database/database.db";
import { WordPracticeData } from "./usePracticeSession";
import { getAuthenticatedUser } from "../../auth/useAuth";

type BucketType = "worstAccuracy" | "leastPracticed" | "newest" | "random";

export type BucketDef = {
  weight: number;
  bucketType: BucketType;
};

export type WordWithStats = {
  word: string;
  avgAccuracy: number | undefined;
  practiceCount: number | undefined;
  lastPracticed: Date | undefined;
  addedAt: Date | undefined;
};

export const bucketWords = (
  numWords: number,
  buckets: BucketDef[],
  wordStats: WordWithStats[]
): WordWithStats[] => {
  const words: Record<string, WordWithStats> = {};
  let totalSize = 0;
  for (const bracket of buckets) {
    if (totalSize >= numWords) break;
    const bucketSize = Math.round(numWords * bracket.weight);

    const sortedBucket = match(bracket.bucketType)
      .with("worstAccuracy", () =>
        wordStats
          .filter((w) => w.avgAccuracy !== undefined)
          .sortBy((r) => r.avgAccuracy, "asc")
      )
      .with("leastPracticed", () =>
        wordStats.sortBy((r) => r.practiceCount ?? 0, "asc")
      )
      .with("newest", () =>
        wordStats.sortBy((r) => r.addedAt?.getTime() ?? 0, "desc")
      )
      .with("random", () => wordStats)
      .exhaustive();

    const bucketWords = sortedBucket
      .filter((r) => !words[r.word])
      .slice(0, bucketSize)
      .shuffle();

    bucketWords.forEach((bw) => {
      if (totalSize >= numWords) return;
      totalSize++;
      words[bw.word] = bw;
    });
  }

  return Object.values(words);
};

export const selectPracticeWords = async (
  numWords: number,
  brackets: BucketDef[]
): Promise<WordPracticeData[]> => {
  const user = getAuthenticatedUser();
  const favs = await db.favourites.where("userId").equals(user.uid).toArray();

  const wordStats = toMap(
    await db.wordStats
      .where("[word+userId]")
      .anyOf(favs.map((f) => [f.word, user.uid]))
      .toArray(),
    (r) => r.word
  );

  const wordWithStats = favs.map((f) => {
    const stats = wordStats.get(f.word);
    return {
      word: f.word,
      addedAt: f.addedAt,
      avgAccuracy: stats?.avgAccuracy,
      practiceCount: stats?.practiceCount,
      lastPracticed: stats?.lastPracticed,
    };
  });

  const wordsWithStats = bucketWords(numWords, brackets, wordWithStats);

  const wordDefs = toMap(
    await db.dictionary
      .where("word")
      .anyOf(wordsWithStats.map((w) => w.word))
      .toArray(),
    (i) => i.word
  );

  return wordsWithStats.reduce((result, wordWithStats) => {
    const { word, avgAccuracy, lastPracticed, practiceCount } = wordWithStats;
    const wordDef = wordDefs.get(word);
    if (!wordDef) return result;

    const chars = word.split("");
    const pinyins = wordDef.pinyin[0].split(" ");
    if (chars.length !== pinyins.length) {
      throw new Error(
        `Word ${wordWithStats} has unmatching number of pinyins and word characters. Pinyin ${wordDef.pinyin[0]}`
      );
    }

    return [
      ...result,
      {
        uuid: crypto.randomUUID(),
        word: word,
        definitions: wordDef.definitions,
        pinyin: wordDef.pinyin[0],
        avgAccuracy,
        practiceCount,
        lastPracticed,
      } as WordPracticeData,
    ];
  }, [] as WordPracticeData[]);
};
