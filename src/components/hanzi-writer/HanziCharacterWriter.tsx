import HanziWriter, { CharacterJson } from "hanzi-writer";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { db } from "../../state/database/database.db";
import { useResettableState } from "../../utils/useResettableState";
import { ArrowPathIcon, LightBulbIcon } from "@heroicons/react/24/outline";
import { useAsyncEffect } from "../../utils/useAsyncEffect";
import { getAccuracy } from "./get-accuracy";

export type HanziWriterReport = {
  hints: number;
  mistakes: number;
  strokes: number;
};

type Props = {
  char: string;
  size: number;
  onComplete: (accuracy: number) => void;
  onAccuracyChange?: (accuracy: number) => void;
};
export const HanziCharacterWriter = (props: Props) => {
  const { char, size } = props;
  const [currentStroke, setCurrentStroke] = useResettableState(() => 0, [char]);
  const [hints, setHints] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const containerRef = useRef<SVGSVGElement>(null);
  const writerInstance = useRef<HanziWriter>(null);
  const strokesNumber = useRef<number>(null);

  useAsyncEffect(async () => {
    if (!containerRef.current || writerInstance.current) return;
    writerInstance.current = HanziWriter.create(
      containerRef.current as any as HTMLElement,
      char,
      {
        width: size,
        height: size,
        showCharacter: false,
        showOutline: false,
        drawingColor: "#73350E",
        drawingWidth: 44,
        strokeHighlightSpeed: 1,
        highlightColor: "#F26C67",
        strokeWidth: 4,
        delayBetweenStrokes: 150,
        highlightCompleteColor: "#DAC99F",
        strokeColor: "#73350E",
        outlineColor: "#DAC99F",
        charDataLoader: async () => {
          const strokeData = await db.strokeData.get(char);
          if (!strokeData)
            throw new Error(`Stroke data for character ${char} not found`);
          return strokeData?.strokes as CharacterJson;
        },
        onCorrectStroke: (data) => {
          props.onAccuracyChange?.(
            getAccuracy({
              hints,
              mistakes: data.totalMistakes,
              strokes: strokesNumber.current!,
            })
          );
        },
        onMistake(strokeData) {
          props.onAccuracyChange?.(
            getAccuracy({
              hints,
              mistakes: strokeData.totalMistakes,
              strokes: strokesNumber.current!,
            })
          );
        },
        onComplete: (summary) => {
          props.onComplete(
            getAccuracy({
              hints,
              mistakes: summary.totalMistakes,
              strokes: strokesNumber.current!,
            })
          );
          setIsCompleted(true);
        },
      }
    );

    const { strokes } = await writerInstance.current.getCharacterData();
    strokesNumber.current = strokes.length;

    // Start the quiz
    writerInstance.current.quiz();
  }, [char, containerRef.current]);

  const showNextStroke = () => {
    writerInstance.current?.highlightStroke(currentStroke);
    setHints((x) => x + 1);
  };

  const reset = () => {
    writerInstance.current?.cancelQuiz();
    writerInstance.current?.quiz();
    setIsCompleted(false);
    setCurrentStroke(0);
  };

  return (
    <>
      <svg
        className="border bg-base-100 rounded-xl block border-base-300 shadow-[0_.1rem_.5rem_-.3rem_#0003]"
        ref={containerRef}
      >
        <line
          x1={size / 2}
          y1="0"
          x2={size / 2}
          y2={size}
          stroke="rgba(0, 0, 0, 0.1)"
        />
        <line
          x1="0"
          y1={size / 2}
          x2={size}
          y2={size / 2}
          stroke="rgba(0, 0, 0, 0.1)"
        />
      </svg>
      <div className="flex flex-row mt-2 justify-between">
        <button
          className="btn btn-sm btn-ghost"
          onClick={showNextStroke}
          disabled={isCompleted}
        >
          <LightBulbIcon className="size-4" />
          Hint
        </button>
        <button className="btn btn-sm btn-ghost" onClick={reset}>
          Reset <ArrowPathIcon className="size-4" />
        </button>
      </div>
    </>
  );
};
