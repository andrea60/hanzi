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
};
