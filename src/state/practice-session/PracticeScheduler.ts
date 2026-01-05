import { toMap } from "../../utils/toMap";
import { db, DictionaryRow, WordStatRow } from "../database/database.db";
import { computeSkillUrgencyScore } from "./computeUrgencyScore";
import { toGroup } from "../../utils/toGroup";
import { toRecord } from "../../utils/toRecord";

export type SkillPracticeResult =
  | "success"
  | "partial-success"
  | "failure"
  | "skipped";
export type Skill = "read" | "write" | "type-pinyi" | "type-hanzi";
export const ALL_SKILLS: Skill[] = [
  "read",
  "write",
  "type-pinyi",
  "type-hanzi",
];

export type WordPracticeData = {
  uuid: string;
  word: string;
  pinyin: string;
  definitions: string[];
  objective: Skill;
  urgency: number;
};

export type WordWithStats = {
  word: string;
  lastPracticedAt: Date | undefined;
  skillStats: Record<Skill, WordSkillStats>;
  addedAt: Date;
};
export type WordSkillStats = {
  /** Total number of times this was practiced */
  totalCount: number;
  /** When this skill was nailed on first try, with no assist or correction */
  successes: number;
  /** When this skill was eventually right, but required multiple attempts or corrections */
  partialSuccesses: number;
  /** When this skill was failed, either because user skipped it or they didn't provide correct answer */
  failures: number;
  lastPracticedAt: Date;
};

export abstract class PracticeScheduler {
  constructor(protected userId: string) {}

  public async nextWords(
    numWords: number,
    skills: Skill[] = ALL_SKILLS
  ): Promise<WordPracticeData[]> {
    const pool = await this.getWordsPool();

    const wordStatsMap = toGroup(
      await this.getWordStats(pool.map((f) => f.word)),
      (r) => r.word
    );

    const wordsSkillsWithUrgency = pool.flatMap((f) => {
      const wordStats = wordStatsMap.get(f.word) ?? [];
      const lastPracticedAt = wordStats.length
        ? new Date(wordStats.max((s) => s.lastPracticedAt.valueOf()))
        : undefined;
      const word = {
        word: f.word,
        addedAt: f.addedAt,
        skillStats: toRecord(wordStats, (r) => r.skill),
        lastPracticedAt,
      };

      return skills.map((skill) => ({
        ...word,
        skill,
        urgency: computeSkillUrgencyScore(word, skill, this.getNow()),
      }));
    });

    // Take only the top N most urgent words
    const uniqueWords = new Set<string>();
    const wordsToPractice = [];
    for (const wordSkill of wordsSkillsWithUrgency.sortByProperty(
      "urgency",
      "desc"
    )) {
      // if buffer is full, stop looking for new words
      if (wordsToPractice.length >= numWords) break;

      // Avoid practicing the same word twice in the same session
      if (uniqueWords.has(wordSkill.word)) continue;

      wordsToPractice.push(wordSkill);
      uniqueWords.add(wordSkill.word);
    }

    const wordDefs = toMap(
      await this.getDefinitions(wordsToPractice.map((w) => w.word)),
      (i) => i.word
    );

    return wordsToPractice.reduce((result, wordWithStats) => {
      const wordDef = wordDefs.get(wordWithStats.word);
      if (!wordDef) return result;

      const chars = wordWithStats.word.split("");
      const pinyins = wordDef.pinyin[0].split(" ");
      if (chars.length !== pinyins.length) {
        throw new Error(
          `Word ${wordWithStats.word} has unmatching number of pinyins and word characters. Pinyin ${wordDef.pinyin[0]}`
        );
      }

      const entry: WordPracticeData = {
        uuid: crypto.randomUUID(),
        word: wordWithStats.word,
        definitions: wordDef.definitions,
        pinyin: wordDef.pinyin[0],
        urgency: wordWithStats.urgency,
        objective: wordWithStats.skill,
      };

      return [...result, entry];
    }, [] as WordPracticeData[]);
  }

  protected abstract getNow(): Date;

  protected abstract getWordsPool(): Promise<{ word: string; addedAt: Date }[]>;

  protected abstract getDefinitions(words: string[]): Promise<DictionaryRow[]>;

  protected abstract getWordStats(words: string[]): Promise<WordStatRow[]>;
}

export class DefaultPracticeScheduler extends PracticeScheduler {
  protected getNow(): Date {
    return new Date();
  }
  protected getWordsPool(): Promise<{ word: string; addedAt: Date }[]> {
    return db.favourites.where("userId").equals(this.userId).toArray();
  }
  protected getWordStats(words: string[]): Promise<WordStatRow[]> {
    return db.wordSkillStatsV3
      .where("[word+userId]")
      .anyOf(words.map((w) => [w, this.userId]))
      .toArray();
  }
  protected getDefinitions(words: string[]): Promise<DictionaryRow[]> {
    return db.dictionary.where("word").anyOf(words).toArray();
  }
}
