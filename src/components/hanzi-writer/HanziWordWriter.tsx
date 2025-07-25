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
import {
  HanziWriterReport,
  HanziCharacterWriter,
} from "../hanzi-writer/HanziCharacterWriter";
import { useResettableState } from "../../utils/useResettableState";
import { getAccuracy } from "./get-accuracy";

type Props = {
  word: string;
  onComplete: (accuracy: number) => void;
};
export const HanziWordWriter = ({ word, onComplete }: Props) => {
  const stepContainer = useRef<HTMLDivElement>(null);
  const chars = useMemo(() => word.split(""), [word]);
  const [containerSize, setContainerSize] = useState<number>();
  const [stepIdx, setStepIdx] = useState(0);
  const [stepStates, setStepStates] = useState<boolean[]>(
    chars.map(() => false)
  );
  const [charsAccuracies, setCharsAccuracies] = useResettableState<number[]>(
    [],
    [chars]
  );

  useLayoutEffect(() => {
    if (!stepContainer.current) return;
    setContainerSize(stepContainer.current?.clientWidth);
  }, []);

  const handleStepComplete = useCallback(
    debounce((step: number, report: HanziWriterReport) => {
      setCharsAccuracies((c) => [...c, getAccuracy(report)]);

      setStepStates((steps) => {
        const newSteps = [...steps];
        newSteps[step] = true;
        return newSteps;
      });

      // Move to next step, if any
      if (step < chars.length - 1) setStepIdx((s) => s + 1);
    }, 1000),
    [chars]
  );

  useEffect(() => {
    const isCompleted = !stepStates.some((s) => s === false);
    if (isCompleted) {
      const avgAccuracy = charsAccuracies.reduce(
        (c, n) => (c + n) / 2,
        charsAccuracies[0]
      );
      onComplete(avgAccuracy);
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
                onComplete={(report) => handleStepComplete(idx, report)}
                size={containerSize}
              />
            </div>
          ))}
      </div>
    </>
  );
};
