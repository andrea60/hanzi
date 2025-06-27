import { useEffect } from "react";

export const useAsyncEffect = (
  callback: () => Promise<unknown>,
  deps: React.DependencyList
) => {
  return useEffect(() => {
    callback();
  }, deps);
};
