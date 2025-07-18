import { useEffect, useMemo, useState } from "react";

type Props = {
  chars: string[];
  pinyin: string[];
};
export const WordPractice = ({ chars, pinyin }: Props) => {
  const [charIdx, setCharIdx] = useResettableState(() => 0, [chars]);

  const currentChar = useMemo(() => chars[charIdx], [chars, charIdx]);

  if (chars.length > 1) {
    // Multi character word
    return (
      <div role="tablist" className="tabs tabs-border">
        {chars.map((x, idx) => (
          <a role="tab" className="tab" key={x}>
            {pinyin[idx]}
          </a>
        ))}
      </div>
    );
  }

  return <div>todo</div>;
};

const useResettableState = <T,>(
  initialStateFactory: () => T,
  deps: unknown[]
) => {
  const [state, setState] = useState(initialStateFactory());

  useEffect(() => {
    setState(initialStateFactory());
  }, [deps]);

  return [state, setState] as const;
};
