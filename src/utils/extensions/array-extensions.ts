declare global {
  interface Array<T> {
    average(): number | undefined;
    sortByProperty<K extends keyof T>(key: K, dir: "asc" | "desc"): T[];
    sortBy(selector: (item: T) => any, dir: "asc" | "desc"): T[];
    min(selector: (item: T) => number): number;
    max(selector: (item: T) => number): number;
    /** Returnes a shuffled copy of the array */
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

Array.prototype.min = function <T>(selector: (item: T) => number) {
  if (this.length === 0) return NaN;
  let min = selector(this[0]);
  for (let i = 1; i < this.length; i++) {
    const val = selector(this[i]);
    if (val < min) min = val;
  }

  return min;
};

Array.prototype.max = function <T>(selector: (item: T) => number) {
  if (this.length === 0) return NaN;
  let max = selector(this[0]);
  for (let i = 1; i < this.length; i++) {
    const val = selector(this[i]);
    if (val > max) max = val;
  }

  return max;
};
