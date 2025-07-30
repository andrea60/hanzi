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
  onAccuracyChange?: (accuracy: number) => void;
};
export const HanziWordWriter = ({
  word,
  onComplete,
  onAccuracyChange,
}: Props) => {
  const stepContainer = useRef<HTMLDivElement>(null);
  const chars = useMemo(() => word.split(""), [word]);
  const [containerSize, setContainerSize] = useState<number>();
  const [stepIdx, setStepIdx] = useState(0);
  const [stepStates, setStepStates] = useState<boolean[]>(
    chars.map(() => false)
  );
  const [charsAccuracies, setCharsAccuracies] = useResettableState<
    Record<number, number>
  >({}, [chars]);

  useLayoutEffect(() => {
    if (!stepContainer.current) return;
    setContainerSize(stepContainer.current?.clientWidth);
  }, []);

  const handleAccuracyChange = (step: number, accuracy: number) => {
    setCharsAccuracies((c) => {
      const newVal = { ...c };
      newVal[step] = accuracy;
      return newVal;
    });
  };

  const handleStepComplete = useCallback(
    debounce((step: number, avgAccuracy: number) => {
      setCharsAccuracies((c) => {
        const newAcc = { ...c };
        newAcc[step] = avgAccuracy;
        return newAcc;
      });

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
    // propagate step completion to parent
    const isCompleted = !stepStates.some((s) => s === false);
    if (isCompleted) {
      onComplete(Object.values(charsAccuracies).average()!);
    }
  }, [stepStates]);

  useEffect(() => {
    // Propage accuracy changes to parent
    const accuracy = Object.values(charsAccuracies).average();
    if (!accuracy) return;
    onAccuracyChange?.(accuracy);
  }, [charsAccuracies]);

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
                onAccuracyChange={(acc) => handleAccuracyChange(idx, acc)}
                size={containerSize}
              />
            </div>
          ))}
      </div>
    </>
  );
};
