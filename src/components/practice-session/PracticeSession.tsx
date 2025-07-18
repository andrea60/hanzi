import { XMarkIcon } from "@heroicons/react/24/solid";
import { usePracticeSession } from "../../state/practice-session/usePracticeSession";
import { useWordDefinition } from "../../state/database/queries/useWordDefinition";
import { WordPractice } from "./WordPractice";

export const PracticeSession = () => {
  const { currentWord } = usePracticeSession();
  const { wordData } = useWordDefinition(currentWord!);

  if (!currentWord) return;

  const chars = currentWord.split("");

  return (
    <div className="card h-full w-full">
      <div className="card-body">
        <h1 className="card-title flex justify-between border-b border-base-300 pb-2">
          Practice Session
          {<XMarkIcon role="button" className="size-6" />}
        </h1>
        <p>
          {wordData?.data?.pinyin.join("+")} - {chars.join(" + ")}
        </p>
        <WordPractice chars={chars} pinyin={wordData.data?.pinyin ?? []} />
      </div>
    </div>
  );
};
