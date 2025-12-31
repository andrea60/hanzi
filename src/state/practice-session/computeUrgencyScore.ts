import { daysSince } from "../../utils/daysSince";
import { WordSkillStats, WordWithStats } from "./PracticeScheduler";
import { Skill } from "./usePracticeSession";

const SKILL_WEIGHTS: Record<Skill, number> = {
  read: 0.25,
  "type-hanzi": 0.25,
  "type-pinyi": 0.25,
  write: 0.25,
};
// Maybe should this compute the `skillUrgencyScore`? And then I can have multiple times the same word in a session
export const computeUrgencyScore = (
  word: WordWithStats,
  skills: Skill[],
  now: Date
): number => {
  const strength = wordStrength(word, skills);

  const forgetting = forgettingFactor(word, strength, now);
  const novelty = noveltyFactor(word, now);

  return forgetting * (1 - strength) * novelty;
};

export const skillStrength = (stats: WordSkillStats | undefined): number => {
  if (!stats || stats.totalCount === 0) return 0;

  const failureRate = stats.failures / stats.totalCount; // range [0, 1]
  const partialSuccessRate = stats.partialSuccesses / stats.totalCount; // range [0, 1]

  const strength = 1 - 0.666 * failureRate - 0.333 * partialSuccessRate;

  return clamp(strength);
};

const wordStrength = (word: WordWithStats, whitelist: Skill[]): number => {
  let total = 0;

  for (const skill of Object.keys(SKILL_WEIGHTS) as Skill[]) {
    if (!whitelist.includes(skill)) continue;
    total += SKILL_WEIGHTS[skill] * skillStrength(word.skillStats[skill]);
  }

  return clamp(total);
};

const forgettingFactor = (
  word: WordWithStats,
  strength: number,
  now: Date
): number => {
  if (!word.lastPracticedAt) return 1;
  const days = daysSince(word.lastPracticedAt, now);

  // strong words decay slower
  const stability = 2 + 10 * strength;

  return Math.exp(days / stability);
};

const noveltyFactor = (word: WordWithStats, now: Date): number => {
  const days = daysSince(word.addedAt, now);
  const maxNovelty = 5;
  if (days <= 0) return maxNovelty;
  return clamp(7 / days, 1, maxNovelty);
};

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
