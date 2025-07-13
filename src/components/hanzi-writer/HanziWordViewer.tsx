import { useEffect, useMemo, useRef } from "react";
import { HanziCharacterViewer } from "./HanziCharacterViewer";
import HanziWriter from "hanzi-writer";
type CancellationToken = {
  cancelled: boolean;
};

type Props = {
  word: string;
  size: number;
};
export const HanziWordViewer = ({ word, size }: Props) => {
  const wordRef = useRef(word);
  const writers = useRef<Record<string, HanziWriter>>({});
  const chars = useMemo(() => word.split(""), [word]);

  useEffect(() => {
    const ct: CancellationToken = { cancelled: false };
    playAnimation(ct);
    return () => {
      console.log("Cancelling animation");
      ct.cancelled = true;
    };
  }, []);

  const handleWriterReady = (char: string, writer: HanziWriter) => {
    writers.current[char] = writer;
  };

  const playAnimation = async (ct: CancellationToken) => {
    while (!ct.cancelled) {
      const wordToAnimate = wordRef.current;
      for (const char of wordToAnimate) {
        const writer = writers.current[char];
        await writer.animateCharacter();
        if (ct.cancelled) break;
      }
    }
    console.log("Animation terminated due to cancellation");
  };

  return (
    <div className="flex flex-row flex-wrap justify-center">
      {chars.map((c) => (
        <HanziCharacterViewer
          key={c}
          size={size}
          char={c}
          onReady={(writer) => handleWriterReady(c, writer)}
        />
      ))}
    </div>
  );
};
