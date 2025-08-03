declare global {
  interface Array<T> {
    average(): number | undefined;
    sortByProperty<K extends keyof T>(key: K, dir: "asc" | "desc"): T[];
    sortBy(selector: (item: T) => any, dir: "asc" | "desc"): T[];
    shuffle(): T[];
  }
}

Array.prototype.average = function (): number | undefined {
  if (this.length === 0) return undefined;
  const sum = this.reduce((acc, val) => acc + val, 0);
  return sum / this.length;
};

Array.prototype.sortByProperty = function <K extends keyof any>(
  key: K,
  dir: "asc" | "desc" = "asc"
): any[] {
  return this.slice().sort((a, b) => {
    if (a[key] < b[key]) return dir === "asc" ? -1 : 1;
    if (a[key] > b[key]) return dir === "asc" ? 1 : -1;
    return 0;
  });
};

Array.prototype.sortBy = function <T>(
  selector: (item: T) => any,
  dir: "asc" | "desc" = "asc"
): T[] {
  return this.slice().sort((a, b) => {
    const aValue = selector(a);
    const bValue = selector(b);
    if (aValue < bValue) return dir === "asc" ? -1 : 1;
    if (aValue > bValue) return dir === "asc" ? 1 : -1;
    return 0;
  });
};

Array.prototype.shuffle = function <T>(): T[] {
  const newArray = this.slice();
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
