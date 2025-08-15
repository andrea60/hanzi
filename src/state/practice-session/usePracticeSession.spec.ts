import { describe, expect, it, suite, test } from "vitest";
import { computeStats } from "./usePracticeSession";

suite("usePracticeSession", () => {
  describe("computeStats", () => {
    it.each([
      {
        prevAvg: 0.1,
        practiceCount: 9,
        sessionAccuracy: 1,
        // expect a little increment
        expected: 0.19,
      },
      {
        prevAvg: 0.1,
        practiceCount: 1,
        sessionAccuracy: 1,
        // should increment a lot because there was only 1 prev session
        expected: 0.55,
      },
    ])(
      "returns the new weighted average based on the previous session average",
      (data) => {
        const y = computeStats(
          {
            avgAccuracy: data.prevAvg,
            practiceCount: data.practiceCount,
            bucketSource: "random",
            definitions: [],
            lastPracticed: undefined,
            pinyin: "",
            uuid: "",
            word: "",
          },
          data.sessionAccuracy
        );

        expect(y.newAvgAccuracy).toBe(data.expected);
      }
    );

    test("if no previous average is available, returns the current session average", () => {
      const y = computeStats(
        {
          avgAccuracy: undefined,
          practiceCount: undefined,
          bucketSource: "random",
          definitions: [],
          lastPracticed: undefined,
          pinyin: "",
          uuid: "",
          word: "",
        },
        0.55
      );

      expect(y.newAvgAccuracy).toBe(0.55);
    });
  });
});
