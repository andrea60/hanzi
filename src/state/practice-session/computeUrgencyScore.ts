import { daysSince } from "../../utils/daysSince";
import { Skill, WordSkillStats, WordWithStats } from "./PracticeScheduler";

// Maybe should this compute the `skillUrgencyScore`? And then I can have multiple times the same word in a session
export const computeSkillUrgencyScore = (
  word: WordWithStats,
  skill: Skill,
  now: Date
): number => {
  const skillStats = word.skillStats[skill];

  const strengthMultiplier = calculateStrengthMultiplier(
    skillStats?.totalCount ?? 0
  );
  const strength = skillStrength(skillStats) * strengthMultiplier;

  const forgetting = forgettingFactor(
    skillStats?.lastPracticedAt,
    strength,
    now
  );
  const novelty = noveltyFactor(word, now);

  const urgency = forgetting * Math.log1p(1 - strength) * novelty;
  return urgency;
};

const sigmoid = (x: number, middlePoint: number) => {
  return 1 / (1 + Math.exp(-(x - middlePoint)));
};

const calculateStrengthMultiplier = (practiceTimes: number) => {
  return 1 - Math.exp(-(practiceTimes / 4));
};

export const skillStrength = (stats: WordSkillStats | undefined): number => {
  if (!stats || stats.totalCount === 0) return 0;

  const failureRate = stats.failures / stats.totalCount; // range [0, 1]
  const partialSuccessRate = stats.partialSuccesses / stats.totalCount; // range [0, 1]

  const strength = 1 - 0.666 * failureRate - 0.333 * partialSuccessRate;

  // a strength of 1 is impossible, it would mean an eternally remembered word
  return clamp(strength, 0, 0.99);
};

const forgettingFactor = (
  lastPracticedAt: Date | undefined,
  strength: number,
  now: Date
): number => {
  if (!lastPracticedAt) return 1;
  // const days = daysSince(lastPracticedAt, now);
  // return sigmoid(days, 3.5);

  if (!lastPracticedAt) return 1;
  const days = daysSince(lastPracticedAt, now);

  // strong words decay slower
  const stability = 2 + 10 * strength;

  return sigmoid(Math.exp(days / stability), 4);
};

const noveltyFactor = (word: WordWithStats, now: Date): number => {
  const days = daysSince(word.addedAt, now);
  // return Math.exp(-(days / 2));
  const maxNovelty = 5;
  if (days <= 0) return maxNovelty;
  return clamp(7 / days, 1, maxNovelty);
};

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
