import Dexie from "dexie";

export type HanziDbRow = {
  character: string;
  pinyin: string;
  strokeData: unknown;
};

export type HanziVersionRow = {
  version: string;
  date: Date;
};

export const hanziDb = new Dexie("hanzi") as Dexie & {
  characters: Dexie.Table<HanziDbRow>;
  versions: Dexie.Table<HanziVersionRow>;
};
hanziDb.version(1).stores({
  characters: "character, pinyin, strokeData",
  versions: "version, date",
});
