import { useRef, useState } from "react";

export const useTimedState = (delay: number) => {
  const timeout = useRef<NodeJS.Timeout>(null);
  const [state, setState] = useState(false);
  const start = () => {
    if (timeout.current) clearInterval(timeout.current);

    timeout.current = setTimeout(() => setState(false), delay);
    setState(true);
  };

  return [state, start] as const;
};
