import Dexie from "dexie";

export type LocalDbStrokeData = {
  char: string;
  strokeData: unknown;
};
export type LocalDbPinyinData = {
  char: string;
  pinyin: string;
};

export type HanziVersionRow = {
  version: string;
  date: Date;
};

export const hanziDb = new Dexie("hanzi") as Dexie & {
  strokeData: Dexie.Table<LocalDbStrokeData>;
  pinyin: Dexie.Table<LocalDbPinyinData>;
  versions: Dexie.Table<HanziVersionRow>;
};
hanziDb.version(1).stores({
  strokeData: "char",
  pinyin: "char, pinyin",
  versions: "version, date",
});
