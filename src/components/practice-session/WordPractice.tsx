import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { WordPracticeData } from "../../state/practice-session/usePracticeSession";
import classNames from "classnames";
import { WordPracticeStep } from "./WordPracticeStep";
import { useResettableState } from "../../utils/useResettableState";
import debounce from "lodash.debounce";

type Props = {
  wordData: WordPracticeData;
  onComplete: () => void;
};
export const WordPractice = ({ wordData, onComplete }: Props) => {
  const stepContainer = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<number>();
  const [stepIdx, setStepIdx] = useState(0);
  const [stepStates, setStepStates] = useState<boolean[]>(
    wordData.steps.map(() => false)
  );

  const multiStepWord = wordData.steps.length > 1;

  useLayoutEffect(() => {
    if (!stepContainer.current) return;
    setContainerSize(stepContainer.current?.clientWidth);
  }, []);

  const handleStepComplete = useCallback(
    debounce((step: number) => {
      setStepStates((steps) => {
        const newSteps = [...steps];
        newSteps[step] = true;
        return newSteps;
      });

      // Move to next step, if any
      if (step < wordData.steps.length - 1) setStepIdx((s) => s + 1);
    }, 1500),
    [wordData]
  );

  useEffect(() => {
    const isCompleted = !stepStates.some((s) => s === false);
    if (isCompleted) onComplete();
  }, [stepStates]);

  return (
    <>
      {multiStepWord && (
        <div className="flex flex-row justify-center mb-4">
          <ul className="menu menu-horizontal p-1.5 bg-base-200 rounded-box">
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
      )}
      <div ref={stepContainer}>
        {containerSize &&
          wordData.steps.map((s, idx) => (
            <div
              key={s.char}
              className={classNames(
                idx === stepIdx ? "flex justify-center" : "hidden"
              )}
            >
              <WordPracticeStep
                step={s}
                size={Math.min(containerSize, 350)}
                onComplete={() => handleStepComplete(idx)}
              />
            </div>
          ))}
      </div>
    </>
  );
};
