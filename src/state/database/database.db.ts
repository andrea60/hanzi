import Dexie from "dexie";
import { Skill } from "../practice-session/usePracticeSession";
import { WordSkillStats } from "../practice-session/PracticeScheduler";

export type DictionaryRow = {
  word: string;
  pinyin: string[];
  searchablePinyin: string;
  definitions: string[];
};
export type StrokeDataRow = {
  char: string;
  strokes: unknown;
};

export type HanziVersionRow = {
  version: number;
  date: Date;
};

export type UserFavouriteRow = {
  word: string;
  userId: string;
  addedAt: Date;
};

export type WordStatRow = {
  word: string;
  skill: Skill;
  userId: string;
  totalCount: number;
  successes: number;
  partialSuccesses: number;
  failures: number;
  lastPracticedAt: Date;
};

export type SessionRow = {
  id: string;
  userId: string;
  timestamp: Date;
  words: string[];
  timeTakenSeconds: number;
};
export const db = new Dexie("hanzi") as Dexie & {
  strokeData: Dexie.Table<StrokeDataRow>;
  dictionary: Dexie.Table<DictionaryRow>;
  versions: Dexie.Table<HanziVersionRow>;
  favourites: Dexie.Table<UserFavouriteRow>;
  wordSkillStats: Dexie.Table<WordStatRow>;
  sessions: Dexie.Table<SessionRow>;
};
db.version(2).stores({
  strokeData: "char",
  dictionary: "word, searchablePinyin",
  versions: "version, date",
  favourites: "[word+userId], userId, addedAt",
  wordSkillStats: "[word+userId], [word+skill+userId], userId",
  sessions: "[id+userId], userId",
});
