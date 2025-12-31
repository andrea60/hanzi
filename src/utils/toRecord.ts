export const toRecord = <T, TKey extends string = string>(
  items: (T | undefined)[],
  keySelector: (item: T) => TKey
): Record<TKey, T> => {
  const dict = {} as Record<TKey, T>;
  items.forEach((item) => {
    if (!item) return; // Skip undefined items
    const key = keySelector(item);
    if (key) {
      dict[key] = item;
    }
  });

  return dict;
};
