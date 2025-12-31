import {
  WordStatRow,
  DictionaryRow,
} from "../../src/state/database/database.db";
import { PracticeScheduler } from "../../src/state/practice-session/PracticeScheduler";
import {
  Skill,
  SkillPracticeResult,
} from "../../src/state/practice-session/usePracticeSession";
import { FakeTime } from "./simulate";

export class InMemoryPracticeScheduler extends PracticeScheduler {
  private stats: Record<string, Record<Skill, WordStatRow>> = {};
  private wordsPool: { word: string; addedAt: Date }[] = [];
  constructor(
    private time: FakeTime,
    userId: string,
    initialWordsCount: number
  ) {
    super(userId);

    this.wordsPool = new Array(initialWordsCount)
      .fill("")
      .map((_, i) => ({ word: "W" + i, addedAt: this.time.now() }));
  }

  public get wordsPoolSize(): number {
    return this.wordsPool.length;
  }
  protected getNow(): Date {
    return this.time.now();
  }

  protected getWordsPool(): Promise<{ word: string; addedAt: Date }[]> {
    return Promise.resolve(this.wordsPool);
  }
  protected getDefinitions(words: string[]): Promise<DictionaryRow[]> {
    return Promise.resolve(
      words.map((word) => ({
        word,
        pinyin: [
          word
            .split("")
            .map(() => "XYZ")
            .join(" "),
        ],
        searchablePinyin: "n/a",
        definitions: [`Definition of ${word}`],
      }))
    );
  }
  protected getWordStats(words: string[]): Promise<WordStatRow[]> {
    return Promise.resolve(
      words.flatMap((word) => Object.values(this.stats[word] || {}))
    );
  }

  public addNewWord(word: string) {
    this.wordsPool.push({ word, addedAt: this.time.now() });
  }

  public recordStats(word: string, skill: Skill, result: SkillPracticeResult) {
    if (!this.stats[word]) {
      this.stats[word] = {} as Record<Skill, WordStatRow>;
    }
    const prev = this.stats[word][skill];
    if (prev) {
      // update existing stats
      this.stats[word][skill] = {
        word,
        skill: skill,
        userId: this.userId,
        totalCount: prev.totalCount + 1,
        failures:
          prev.failures +
          (result === "failure" || result === "skipped" ? 1 : 0),
        partialSuccesses:
          prev.partialSuccesses + (result === "partial-success" ? 1 : 0),
        successes: prev.successes + (result === "success" ? 1 : 0),
        lastPracticedAt: this.time.now(),
      };
    } else {
      // create new stats
      this.stats[word][skill] = {
        word,
        skill: skill,
        userId: this.userId,
        totalCount: 1,
        failures: result === "failure" || result === "skipped" ? 1 : 0,
        partialSuccesses: result === "partial-success" ? 1 : 0,
        successes: result === "success" ? 1 : 0,
        lastPracticedAt: this.time.now(),
      };
    }
  }
}
