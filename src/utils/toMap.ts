export const toMap = <T>(
  items: (T | undefined)[],
  keySelector: (item: T) => string
): Map<string, T> => {
  let map = new Map<string, T>();
  items.forEach((item) => {
    if (!item) return; // Skip undefined items
    const key = keySelector(item);
    if (key) {
      map = map.set(key, item);
    }
  });

  return map;
};
