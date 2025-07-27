export const QueryKey = {
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
    return ["stats", "session", "avg-accuracy"];
  },
  SessionsHistory(limit: number) {
    return ["stats", "session", limit];
  },
  WordsAccuracyStats(direction: string, limit: number) {
    return ["stats", "words", "accuracy", direction, limit];
  },
};
