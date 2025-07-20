import { useEffect, useMemo, useState } from "react";
import { WordPracticeData } from "../../state/practice-session/usePracticeSession";
import classNames from "classnames";

type Props = {
  wordData: WordPracticeData;
};
export const WordPractice = ({ wordData }: Props) => {
  const [stepIdx, setStepIdx] = useResettableState(() => 0, [wordData]);

  return (
    <div className="flex flex-row justify-center">
      <ul className="menu menu-horizontal menu-sm p-1.5 bg-base-200 rounded-box">
        {wordData.steps.map((step, idx) => (
          <li key={step.char} className="">
            <a
              className={classNames("min-w-16 justify-center", {
                "menu-active": idx === stepIdx,
              })}
              onClick={() => setStepIdx(idx)}
            >
              {step.pinyin}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

const useResettableState = <T,>(
  initialStateFactory: () => T,
  deps: unknown[]
) => {
  const [state, setState] = useState(() => initialStateFactory());

  useEffect(() => {
    setState(initialStateFactory());
  }, [...deps]);

  return [state, setState] as const;
};
