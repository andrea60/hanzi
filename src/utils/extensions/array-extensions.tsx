declare global {
  interface Array<T> {
    average(): number | undefined;
  }
}

Array.prototype.average = function (): number | undefined {
  if (this.length === 0) return undefined;
  const sum = this.reduce((acc, val) => acc + val, 0);
  return sum / this.length;
};
