export const toGroup = <T>(
  items: (T | undefined)[],
  keySelector: (item: T) => string
): Map<string, T[]> => {
  let map = new Map<string, T[]>();
  items.forEach((item) => {
    if (!item) return; // Skip undefined items
    const key = keySelector(item);
    if (key) {
      const group = map.get(key) || [];
      group.push(item);
      map.set(key, group);
    }
  });

  return map;
};
