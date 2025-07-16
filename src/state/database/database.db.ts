import Dexie from "dexie";

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
  version: string;
  date: Date;
};

export type UserFavouriteRow = {
  word: string;
  userId: string;
  addedAt: Date;
};

export type WordStatRow = {
  word: string;
  userId: string;
  practiceCount: number;
  lastPracticed: Date;
  avgConfidence: number;
};

export const db = new Dexie("hanzi") as Dexie & {
  strokeData: Dexie.Table<StrokeDataRow>;
  dictionary: Dexie.Table<DictionaryRow>;
  versions: Dexie.Table<HanziVersionRow>;
  favourites: Dexie.Table<UserFavouriteRow>;
  wordStats: Dexie.Table<WordStatRow>;
};
db.version(1).stores({
  strokeData: "char",
  dictionary: "word, searchablePinyin",
  versions: "version, date",
  favourites: "[word+userId], userId",
});
