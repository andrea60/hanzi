import { BucketDef } from "../../state/practice-session/PracticeScheduler";

type TemplateDef = {
  name: string;
  description: string;
  buckets: BucketDef[];
};
type TemplatesStore = Record<string, TemplateDef>;

export const PracticeTemplates: TemplatesStore = {
  default: {
    name: "Your Everyday Learning Session",
    description:
      "A balanced session which reviews recently learned words, some words you struggle with, and refreshes words you haven't seen in a while",
    buckets: [
      { bucketType: "newest", weight: 0.25 },
      { bucketType: "worstAccuracy", weight: 0.25 },
      { bucketType: "leastPracticed", weight: 0.25 },
      { bucketType: "random", weight: 0.25 },
    ],
  },
  newWords: {
    name: "Consolidate New Words",
    description: "Heavily focuses on the words you have learned recently",
    buckets: [
      { bucketType: "newest", weight: 0.75 },
      { bucketType: "random", weight: 0.25 },
    ],
  },
  weakPoints: {
    name: "Improve Your Weak Points",
    description: "Focuses on the words you struggle with the most",
    buckets: [
      { bucketType: "worstAccuracy", weight: 0.75 },
      { bucketType: "random", weight: 0.25 },
    ],
  },
  refresher: {
    name: "Refresh Your Memory",
    description: "Revisits words you haven't seen in a while",
    buckets: [
      { bucketType: "lastPracticed", weight: 0.75 },
      { bucketType: "random", weight: 0.25 },
    ],
  },
};
