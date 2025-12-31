import {
  Skill,
  SkillPracticeResult,
} from "../../src/state/practice-session/usePracticeSession";
import { daysSince } from "../../src/utils/daysSince";
import { FakeTime } from "./simulate";

const rnd = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

interface SimulationUser {
  /** Practice a given word\skill pair */
  practice(word: string, skill: Skill): SkillPracticeResult;
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

const CONSOLIDATION_GAIN = 0.08;
const MIN_RECALL = 0.25;
const PARTIAL_RECALL = 0.5;

export class SimulatedUser implements SimulationUser {
  public memory = new Map<string, MemoryItem>();

  private key(word: string, skill: Skill) {
    return `${word}:${skill}`;
  }

  constructor(
    private time: FakeTime,
    private skillMultipliers: Map<Skill, number>
  ) {}

  practice(word: string, skill: Skill): SkillPracticeResult {
    const key = this.key(word, skill);
    const item = this.memory.get(key) ?? {
      strength: rnd(0.4, 0.9), // a word is usually learned from outside the app, so the user brings some basic memory already
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
      item.stability += CONSOLIDATION_GAIN;
    } else {
      result = "failure";
      item.strength += SUCCESS_GAIN * 0.5; // smaller gain on failure, as the apps explains why it failed
      item.stability /= 2;
    }

    item.lastPracticed = this.time.now();
    item.practiceCount++;
    item.strength = clamp(item.strength);
    item.stability = clamp(item.stability);
    this.memory.set(key, item);

    return result;
  }
}

const clamp = (val: number, min: number = 0, max: number = 1): number => {
  return Math.min(max, Math.max(min, val));
};
