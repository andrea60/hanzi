import { useEffect, useState } from "react";

export const useResettableState = <T,>(
  initialState: T | (() => T),
  deps: unknown[]
) => {
  const [state, setState] = useState(() => resolve(initialState));

  useEffect(() => {
    setState(resolve(initialState));
  }, [...deps]);

  return [state, setState] as const;
};

const resolve = <T,>(v: T | (() => T)): T => {
  return typeof v === "function" ? (v as () => T)() : v;
};
