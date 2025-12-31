import { match } from "ts-pattern";
import { toMap } from "../../utils/toMap";
import { db, DictionaryRow, WordStatRow } from "../database/database.db";
import {
  ALL_SKILLS,
  PracticeMode,
  Skill,
  WordPracticeData,
} from "./usePracticeSession";
import { computeUrgencyScore, skillStrength } from "./computeUrgencyScore";
import { toGroup } from "../../utils/toGroup";
import { toRecord } from "../../utils/toRecord";

export type BucketType =
  | "worstAccuracy"
  | "leastPracticed"
  | "lastPracticed"
  | "newest"
  | "random";

export type BucketDef = {
  weight: number;
  bucketType: BucketType;
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

    const wordsWithUrgency = pool.map((f) => {
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

      const urgency = computeUrgencyScore(word, skills, this.getNow());

      return { ...word, urgency };
    });

    // Take only the top N most urgent words
    const wordsToPractice = wordsWithUrgency
      .sortByProperty("urgency", "desc")
      .slice(0, numWords);

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
        objective: this.selectSkillToPractice(wordWithStats),
      };

      return [...result, entry];
    }, [] as WordPracticeData[]);
  }

  protected abstract getNow(): Date;

  protected abstract getWordsPool(): Promise<{ word: string; addedAt: Date }[]>;

  protected abstract getDefinitions(words: string[]): Promise<DictionaryRow[]>;

  protected abstract getWordStats(words: string[]): Promise<WordStatRow[]>;

  private selectSkillToPractice(word: WordWithStats): Skill {
    const unpracticedSkills = this.findUnpracticedSkill(word.skillStats);

    // If there are unpracticed skills, prioritize them over anything else
    if (unpracticedSkills) return unpracticedSkills;

    const skillStrengths = (Object.keys(word.skillStats) as Skill[]).map(
      (skill) => ({
        skill,
        strength: skillStrength(word.skillStats[skill]),
        last: word.skillStats[skill].lastPracticedAt,
      })
    );
    return skillStrengths.sort((a, b) =>
      a.strength !== b.strength
        ? a.strength - b.strength
        : a.last.valueOf() - b.last.valueOf()
    )[0].skill;
  }
  private findUnpracticedSkill(skillStats: Record<Skill, WordSkillStats>) {
    for (const skill of ALL_SKILLS) {
      if (!skillStats[skill] || skillStats[skill].totalCount === 0) {
        return skill;
      }
    }
    return undefined;
  }
}

export class DefaultPracticeScheduler extends PracticeScheduler {
  protected getNow(): Date {
    return new Date();
  }
  protected getWordsPool(): Promise<{ word: string; addedAt: Date }[]> {
    return db.favourites.where("userId").equals(this.userId).toArray();
  }
  protected getWordStats(words: string[]): Promise<WordStatRow[]> {
    return db.wordSkillStats
      .where("[word+userId]")
      .anyOf(words.map((w) => [w, this.userId]))
      .toArray();
  }
  protected getDefinitions(words: string[]): Promise<DictionaryRow[]> {
    return db.dictionary.where("word").anyOf(words).toArray();
  }
}
