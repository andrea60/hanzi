import {
  Skill,
  SkillPracticeResult,
} from "../../src/state/practice-session/usePracticeSession";
import { daysSince } from "../../src/utils/daysSince";
import { FakeTime } from "./simulate";

type WordSkill = string;

const rnd = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

interface SimulationUser {
  /** Practice a given word\skill pair */
  practice(word: string, skill: Skill): SkillPracticeResult;
}
export class User {
  public static readonly SHORT_TERM_PRACTICE_WINDOW_DAYS = 30;
  /** How strongly the user remembers each word */
  public memory: Map<WordSkill, number> = new Map();
  public practiceCounts: Map<WordSkill, number> = new Map();
  private _shortTermPracticeCounts: Map<WordSkill, Array<number>> = new Map();
  public lastPracticed: Map<WordSkill, Date> = new Map();
  public get shortTermPracticeCounts() {
    return this._shortTermPracticeCounts.entries().reduce((acc, [key, set]) => {
      const count = set.length;
      if (count > 0) {
        acc.set(key, count);
      }
      return acc;
    }, new Map<WordSkill, number>());
  }
  constructor(
    private time: FakeTime,
    private memoryDecayHalfLife: number,
    private weaknessMap: Map<Skill, number>
  ) {}

  private getMemoryKey(word: string, skill: Skill): WordSkill {
    return `${word}:${skill}`;
  }

  practice(word: string, skill: Skill): SkillPracticeResult {
    const key = this.getMemoryKey(word, skill);

    // update memory
    this.increasePracticeCount(word, skill);
    this.lastPracticed.set(key, this.time.now());

    const memory = this.memory.get(key) || 0;
    const forgetRate = clamp(1 - memory + rnd(-0.1, 0.1));
    if (memory <= 0.2) {
      // completely forgot the word
      this.memory.set(key, rnd(0.2, 0.6));
      return "skipped";
    }
    // determine result based on memory and some randomness
    const roll = Math.random();
    let result: SkillPracticeResult;
    if (roll < forgetRate) {
      result = "failure";
    } else if (roll < forgetRate + 0.3) {
      result = "partial-success";
    } else {
      result = "success";
    }

    // Update memory based on practice and some randomness
    this.memory.set(key, 1 - rnd(0, 0.2));

    return result;
  }

  private increasePracticeCount(word: string, skill: Skill) {
    const key = this.getMemoryKey(word, skill);

    // Add to long term practice counts
    const count = this.practiceCounts.get(key) || 0;
    this.practiceCounts.set(key, count + 1);

    // Add to short term practice counts
    const shortTermSet = this._shortTermPracticeCounts.get(key) || [];
    shortTermSet.push(this.time.now().valueOf());
    this._shortTermPracticeCounts.set(key, shortTermSet);
  }

  nextDay() {
    // simulate memory decay
    for (const key of this.memory.keys()) {
      const current = this.memory.get(key) || 0;
      const decayed =
        current *
        (1 - this.getMemoryDecayRate(this.practiceCounts.get(key) ?? 0));
      this.memory.set(key, decayed);
    }

    // Clear short term practice counts
    const cutoff =
      this.time.now().valueOf() -
      User.SHORT_TERM_PRACTICE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    for (const [key, set] of this._shortTermPracticeCounts.entries()) {
      const cleanedSet = set.filter((s) => s > cutoff);
      this._shortTermPracticeCounts.set(key, cleanedSet);
    }
  }

  getMemoryDecayRate(practiceCounts: number): number {
    const exp =
      (Math.log(0.5) / Math.sqrt(this.memoryDecayHalfLife)) *
      Math.sqrt(practiceCounts);
    return Math.pow(Math.E, exp);
  }
}

type MemoryItem = {
  strength: number; // activation level
  stability: number; // decay resistance
  lastPracticed: Date;
  practiceCount: number;
};

const BASE_DECAY = 0.15; // daily decay rate
const SUCCESS_GAIN = 0.35;
const PARTIAL_GAIN = 0.15;
const FAILURE_PENALTY = 0.2;

const CONSOLIDATION_GAIN = 0.08;
const MIN_RECALL = 0.25;
const PARTIAL_RECALL = 0.5;

export class SimulatedUser implements SimulationUser {
  public memory = new Map<string, MemoryItem>();

  private key(word: string, skill: Skill) {
    return `${word}:${skill}`;
  }

  constructor(private time: FakeTime) {}

  practice(word: string, skill: Skill): SkillPracticeResult {
    const key = this.key(word, skill);
    const item = this.memory.get(key) ?? {
      strength: rnd(0.1, 0.3), // a word is usually learned from outside the app, so the user brings some basic memory already
      stability: 1,
      lastPracticed: this.time.now(),
      practiceCount: 0,
    };

    // Apply decay since last practice
    const daysPassed = Math.abs(daysSince(this.time.now(), item.lastPracticed));
    const decay = Math.exp((-BASE_DECAY * daysPassed) / item.stability);
    item.strength *= decay + rnd(-0.1, 0.1);

    let result: SkillPracticeResult;

    if (item.strength >= PARTIAL_RECALL) {
      result = "success";
      item.strength += SUCCESS_GAIN;
      item.stability += CONSOLIDATION_GAIN;
    } else if (item.strength >= MIN_RECALL) {
      result = "partial-success";
      item.strength += PARTIAL_GAIN;
      item.stability += CONSOLIDATION_GAIN * 0.5;
    } else {
      result = "failure";
      item.strength = SUCCESS_GAIN * 0.5; // smaller gain on failure, as the apps explains why it failed
      item.stability /= 2;
    }

    item.lastPracticed = this.time.now();
    item.practiceCount++;
    this.memory.set(key, item);

    return result;
  }
}
