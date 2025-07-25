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
};
