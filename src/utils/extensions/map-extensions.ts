declare global {
  interface Map<K, V> {
    map<TResult>(select: (value: V) => TResult): Map<K, TResult>;
  }
}

Map.prototype.map = function <K, V, TResult>(
  select: (value: V) => TResult
): Map<K, TResult> {
  const result = new Map<K, TResult>();
  for (const [key, source] of this.entries()) result.set(key, select(source));
  return result;
};
