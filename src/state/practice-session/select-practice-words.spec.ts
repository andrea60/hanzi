import { describe, expect, suite, test } from "vitest";
import { BucketDef, bucketWords, WordWithStats } from "./select-practice-words";

const wordWithStats = (
  x: Partial<WordWithStats> & { word: string }
): WordWithStats => {
  return {
    word: x.word,
    avgAccuracy: x.avgAccuracy ?? undefined,
    practiceCount: x.practiceCount ?? undefined,
    lastPracticed: x.lastPracticed ?? undefined,
    addedAt: x.addedAt ?? undefined,
  };
};

suite("bucketWords", () => {
  describe("multi-bucket", () => {
    const wordStats = [
      wordWithStats({ word: "A", avgAccuracy: 0.2, practiceCount: 1000 }),
      wordWithStats({ word: "B", avgAccuracy: 0.2, practiceCount: 1000 }),
      wordWithStats({ word: "C", avgAccuracy: 0.2, practiceCount: 1000 }),
      wordWithStats({ word: "D", avgAccuracy: 0.2, practiceCount: 1000 }),
      wordWithStats({ word: "E", avgAccuracy: 0.2, practiceCount: 1000 }),
      wordWithStats({ word: "F", avgAccuracy: 0.2, practiceCount: 1000 }),
      wordWithStats({ word: "G", avgAccuracy: 0.2, practiceCount: 1000 }),
      wordWithStats({ word: "H", avgAccuracy: 0.2, practiceCount: 1000 }),
      wordWithStats({ word: "I", avgAccuracy: 0.2, practiceCount: 1000 }),
      wordWithStats({ word: "L", avgAccuracy: 0.2, practiceCount: 1000 }),
    ];
    test.each([
      { bucketSizes: [0.33333, 0.66666], numWords: 5 },
      { bucketSizes: [0.5, 0.5], numWords: 5 },
      { bucketSizes: [0.9, 0.1], numWords: 1 },
      { bucketSizes: [0.25, 0.25, 0.25, 0.25], numWords: 10 },
      { bucketSizes: [0.25, 0.25, 0.25, 0.25], numWords: 7 },
    ])(
      "should always return %numWords of words with bucketSizes %bucketSizes",
      ({ bucketSizes, numWords }) => {
        const buckets: BucketDef[] = bucketSizes.map((size, i) => ({
          weight: size,
          bucketType: "worstAccuracy",
        }));

        const words = bucketWords(numWords, buckets, wordStats).map(
          (w) => w.word
        );

        expect(words.length).toBe(numWords);
      }
    );

    test("a word can only appear once", () => {
      const wordStats = [
        wordWithStats({ word: "C", avgAccuracy: 1, practiceCount: 0 }),
        wordWithStats({ word: "D", avgAccuracy: 1, practiceCount: 2 }),
        wordWithStats({ word: "A", avgAccuracy: 0.2, practiceCount: 1000 }),
        // this word is the worst in accuracy and the second worst in practice count:
        wordWithStats({ word: "X", avgAccuracy: 0.1, practiceCount: 1 }),
        wordWithStats({ word: "B", avgAccuracy: 0.3, practiceCount: 1000 }),
        // this word is the 4th in practice count, so normally it wouldn't be selected but since "X" is the worst in accuracy and can't be picked for the 2nd bucket, this is picked instead:
        wordWithStats({ word: "E", avgAccuracy: 1, practiceCount: 3 }),
      ];

      const buckets: BucketDef[] = [
        {
          bucketType: "worstAccuracy",
          weight: 0.5,
        },
        {
          bucketType: "leastPracticed",
          weight: 0.5,
        },
      ];

      const words = bucketWords(6, buckets, wordStats).map((w) => w.word);

      expect(words.length).toBe(6);
      expect(words).toContain("E");
    });
  });

  test("if numWords is greater than wordStats, it should return all words", () => {
    const wordStats: WordWithStats[] = [
      wordWithStats({ word: "a", avgAccuracy: 0.5 }),
      wordWithStats({ word: "b", avgAccuracy: 0.6 }),
      wordWithStats({ word: "c", avgAccuracy: 0.7 }),
    ];
    const words = bucketWords(
      5,
      [{ bucketType: "worstAccuracy", weight: 1 }],
      wordStats
    ).map((w) => w.word);

    expect(words.length).toEqual(3);
  });

  describe("bucketType=leastPracticed", () => {
    test("should return least practiced words first", () => {
      const wordStats: WordWithStats[] = [
        wordWithStats({ word: "b", practiceCount: 2 }),
        wordWithStats({ word: "e", practiceCount: 6 }),
        wordWithStats({ word: "a", practiceCount: 3 }),
        wordWithStats({ word: "c", practiceCount: 1 }),
      ];

      const words = bucketWords(
        3,
        [{ bucketType: "leastPracticed", weight: 1 }],
        wordStats
      ).map((w) => w.word);

      expect(words.length).toBe(3);
      expect(words).toContain("a");
      expect(words).toContain("b");
      expect(words).toContain("c");
    });
    test("should consider never practiced words without practiceCount", () => {
      const wordStats: WordWithStats[] = [
        wordWithStats({ word: "b", practiceCount: 2 }),
        wordWithStats({ word: "e" }), // never practiced
        wordWithStats({ word: "a", practiceCount: 3 }),
        wordWithStats({ word: "c", practiceCount: 1 }),
      ];

      const words = bucketWords(
        3,
        [{ bucketType: "leastPracticed", weight: 1 }],
        wordStats
      ).map((w) => w.word);

      expect(words.length).toBe(3);
      expect(words).toContain("c");
      expect(words).toContain("b");
      expect(words).toContain("e");
    });
  });

  describe("bucketType=worstAccuracy", () => {
    test("should return words with lowest accuracy first", () => {
      const wordStats: WordWithStats[] = [
        wordWithStats({ word: "b", avgAccuracy: 0.2 }),
        wordWithStats({ word: "e", avgAccuracy: 0.6 }),
        wordWithStats({ word: "a", avgAccuracy: 0.3 }),
        wordWithStats({ word: "c", avgAccuracy: 0.1 }),
      ];

      const words = bucketWords(
        3,
        [{ bucketType: "worstAccuracy", weight: 1 }],
        wordStats
      ).map((w) => w.word);

      expect(words.length).toBe(3);
      expect(words).toContain("c");
      expect(words).toContain("b");
      expect(words).toContain("a");
    });
    test("should not consider words which have no accuracy data", () => {
      const wordStats: WordWithStats[] = [
        wordWithStats({ word: "a" }), // never practiced
        wordWithStats({ word: "b", avgAccuracy: 0.1 }),
      ];

      const words = bucketWords(
        3,
        [{ bucketType: "worstAccuracy", weight: 1 }],
        wordStats
      ).map((w) => w.word);

      expect(words).toEqual(["b"]);
    });
  });
  describe("bucketType=newest", () => {
    test("should return words which have been recently added first", () => {
      const wordStats: WordWithStats[] = [
        wordWithStats({ word: "b", addedAt: new Date("2020-01-03") }),
        wordWithStats({ word: "e", addedAt: new Date("2020-01-01") }),
        wordWithStats({ word: "a", addedAt: new Date("2020-01-04") }),
        wordWithStats({ word: "c", addedAt: new Date("2020-01-02") }),
      ];

      const words = bucketWords(
        3,
        [{ bucketType: "newest", weight: 1 }],
        wordStats
      ).map((w) => w.word);

      expect(words.length).toBe(3);
      expect(words).toContain("a");
      expect(words).toContain("b");
      expect(words).toContain("c");
    });
  });

  describe("bucketType=random", () => {
    test("should return same words", () => {
      const wordStats: WordWithStats[] = [
        wordWithStats({ word: "b" }),
        wordWithStats({ word: "e" }),
        wordWithStats({ word: "a" }),
        wordWithStats({ word: "c" }),
      ];

      const words = bucketWords(
        4,
        [{ bucketType: "random", weight: 1 }],
        wordStats
      ).map((w) => w.word);

      expect(words.length).toBe(4);
    });
  });
});
