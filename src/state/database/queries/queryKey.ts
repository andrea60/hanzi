export const QueryKey = {
  Stats() {
    return ["stats"];
  },
  WordDefinition(word: string) {
    return ["word", word];
  },
  Favourites() {
    return ["favourites"];
  },
  FavouritesCount() {
    return ["favourites", "count"];
  },
  AverageSessionAccuracy() {
    return [...QueryKey.Stats(), "session", "avg-accuracy"];
  },
  SessionsHistory(limit: number) {
    return [...QueryKey.Stats(), "session", limit];
  },
  WordsAccuracyStats(direction: string, limit: number) {
    return [...QueryKey.Stats(), "words", "accuracy", direction, limit];
  },
};
