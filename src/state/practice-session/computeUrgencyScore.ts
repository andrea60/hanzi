import { daysSince } from "../../utils/daysSince";
import { random } from "../../utils/random";
import { WordSkillStats, WordWithStats } from "./PracticeScheduler";
import { Skill } from "./usePracticeSession";

const SKILL_WEIGHTS: Record<Skill, number> = {
  read: 0.25,
  "type-hanzi": 0.25,
  "type-pinyi": 0.25,
  write: 0.25,
};
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

  const urgency =
    Math.log1p(forgetting) * Math.log1p(1 - strength) * Math.log1p(novelty);
  return urgency;
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

const wordStrength = (word: WordWithStats, whitelist: Skill[]): number => {
  let total = 0;

  for (const skill of Object.keys(SKILL_WEIGHTS) as Skill[]) {
    if (!whitelist.includes(skill)) continue;
    total += SKILL_WEIGHTS[skill] * skillStrength(word.skillStats[skill]);
  }

  return clamp(total);
};

const forgettingFactor = (
  lastPracticedAt: Date | undefined,
  strength: number,
  now: Date
): number => {
  if (!lastPracticedAt) return 1;
  const days = daysSince(lastPracticedAt, now);

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
