import HanziWriter, { CharacterJson } from "hanzi-writer";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { db } from "../../state/database/database.db";

type Props = {
  char: string;
  size: number;
};
export const HanziCharacterWriter = ({ char, size }: Props) => {
  const containerRef = useRef<SVGSVGElement>(null);
  const writerInstance = useRef<HanziWriter>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const writer = HanziWriter.create(
      containerRef.current as any as HTMLElement,
      char,
      {
        width: size,
        height: size,
        showCharacter: false,
        showOutline: false,
        drawingColor: "#73350E",
        drawingWidth: 28,
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
      }
    );

    writer.quiz({
      onCorrectStroke: (data) => {
        console.log(data.strokeNum);
      },
    });

    writerInstance.current = writer;
  }, [char, containerRef.current]);

  const hint = () => {
    writerInstance.current?.highlightStroke(1);
  };

  return (
    <>
      <svg
        className="border border-base-300 bg-base-200 rounded-xl"
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
      <button onClick={hint}>A</button>
    </>
  );
};
