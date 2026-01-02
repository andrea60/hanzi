import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import classNames from "classnames";
import debounce from "lodash.debounce";
import { HanziCharacterWriter } from "../hanzi-writer/HanziCharacterWriter";

type Props = {
  word: string;
  onComplete: (failed: boolean, usedHints: boolean) => void;
};
export const HanziWordWriter = ({ word, onComplete }: Props) => {
  const stepContainer = useRef<HTMLDivElement>(null);
  const chars = useMemo(() => word.split(""), [word]);
  const [containerSize, setContainerSize] = useState<number>();
  const [stepIdx, setStepIdx] = useState(0);
  const [stepStates, setStepStates] = useState<boolean[]>(
    chars.map(() => false)
  );
  const [usedHints, setUsedHints] = useState(false);
  const [failed, setFailed] = useState(false);

  useLayoutEffect(() => {
    if (!stepContainer.current) return;
    setContainerSize(stepContainer.current?.clientWidth);
  }, []);

  const handleStepComplete = useCallback(
    debounce((step: number, failed: boolean, usedHints: boolean) => {
      setStepStates((steps) => {
        const newSteps = [...steps];
        newSteps[step] = true;
        return newSteps;
      });
      if (failed) setFailed(true);
      if (usedHints) setUsedHints(true);

      // Move to next step, if any
      if (step < chars.length - 1) setStepIdx((s) => s + 1);
    }, 1000),
    [chars]
  );

  useEffect(() => {
    // propagate step completion to parent
    const isCompleted = !stepStates.some((s) => s === false);
    if (isCompleted) {
      onComplete(failed, usedHints);
    }
  }, [stepStates]);

  return (
    <>
      <div className="flex flex-row justify-center mb-4">
        {chars.map((char, idx) => (
          <div
            key={char}
            className={classNames(
              "text-xl  bg-base-100 size-10 border border-base-300 flex items-center justify-center rounded",
              { "border-2 border-base-content font-bold": idx == stepIdx }
            )}
            onClick={() => setStepIdx(idx)}
          >
            {stepStates[idx] ? char : "?"}
          </div>
        ))}
      </div>
      <div ref={stepContainer} className="max-w-72 w-full m-auto">
        {!!containerSize &&
          chars.map((char, idx) => (
            <div
              key={char}
              className={classNames(idx === stepIdx ? "block" : "hidden")}
            >
              <HanziCharacterWriter
                char={char}
                maxHints={2}
                maxFails={5}
                onComplete={(failed, useHints) =>
                  handleStepComplete(idx, failed, useHints)
                }
                size={containerSize}
              />
            </div>
          ))}
      </div>
    </>
  );
};
