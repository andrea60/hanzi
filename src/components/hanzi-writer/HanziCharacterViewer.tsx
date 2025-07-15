import { useEffect, useRef } from "react";
import HanziWriter, { CharacterJson } from "hanzi-writer";
import { db } from "../../state/database/database.db";

type Props = {
  char: string;
  size: number;
  loopAnimation?: boolean;
  onReady?: (writer: HanziWriter) => void;
};
export const HanziCharacterViewer = ({
  char,
  size,
  onReady,
  loopAnimation,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const init = useRef(false);

  useEffect(() => {
    if (!ref.current || init.current) return;

    const writer = HanziWriter.create(ref.current, char, {
      width: size,
      height: size,
      delayBetweenStrokes: 150,
      strokeColor: "#73350E",
      outlineColor: "#DAC99F",
      charDataLoader: async () => {
        const strokeData = await db.strokeData.get(char);
        if (!strokeData)
          throw new Error(`Stroke data for character ${char} not found`);
        return strokeData?.strokes as CharacterJson;
      },
    });

    if (loopAnimation) writer.loopCharacterAnimation();

    onReady?.(writer);
    init.current = true;
  }, [ref.current, char]);

  return <div ref={ref} />;
};
