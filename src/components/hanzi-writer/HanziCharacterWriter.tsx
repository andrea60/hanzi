import HanziWriter, { CharacterJson } from "hanzi-writer";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { db } from "../../state/database/database.db";
import { useResettableState } from "../../utils/useResettableState";
import { ArrowPathIcon, LightBulbIcon } from "@heroicons/react/24/outline";

type Props = {
  char: string;
  size: number;
  onComplete: (usedHint: boolean, totalMistakes: number) => void;
};
export const HanziCharacterWriter = (props: Props) => {
  const { char, size } = props;
  const [currentStroke, setCurrentStroke] = useResettableState(() => 0, [char]);
  const [hasUsedHint, setHasUsedHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const containerRef = useRef<SVGSVGElement>(null);
  const writerInstance = useRef<HanziWriter>(null);

  useEffect(() => {
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
          setCurrentStroke(data.strokeNum + 1);
        },
        onComplete: (summary) => {
          props.onComplete(hasUsedHint, summary.totalMistakes);
          setIsCompleted(true);
        },
      }
    );

    writerInstance.current.quiz();
  }, [char, containerRef.current]);

  const showNextStroke = () => {
    writerInstance.current?.highlightStroke(currentStroke);
    setHasUsedHint(true);
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
        className="border border-base-300 bg-base-200 rounded-xl block"
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
