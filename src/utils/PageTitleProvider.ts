import { atom, useAtom } from "jotai";
import { useEffect } from "react";

const pageTitleAtom = atom<string>();

export const usePageTitle = (title: string, deps: unknown[]) => {
  const [, setState] = useAtom(pageTitleAtom);

  useEffect(() => {
    setState(title);
  }, [...deps]);
};
export const useCurrentPageTitle = () => {
  const [state] = useAtom(pageTitleAtom);

  return state;
};
