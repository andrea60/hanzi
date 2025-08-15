import {
  ArchiveBoxIcon,
  ArrowDownCircleIcon,
  ClockIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import {
  ArrowUpCircleIcon,
  ArrowUpIcon,
  HandThumbDownIcon,
  HandThumbUpIcon,
} from "@heroicons/react/24/solid";
import { RadialProgress } from "../../ui/RadialProgress";
import { PropsWithChildren, useMemo } from "react";
import { usePracticeSession } from "../../../state/practice-session/usePracticeSession";
import { useWordDefinition } from "../../../state/database/queries/useWordDefinition";
import { AnimatedNumber } from "../../ui/AnimatedNumber";
import { useAverageSessionAccuracy } from "../../../state/database/queries/useAverageAccuracy";
import { WordsComparison } from "./WordsComparison";

export const EndSessionReport = () => {
  const {
    isCompleted,
    isRunning,
    stats,
    closeSession,
    avgAccuracy,
    timeTakenSeconds,
  } = usePracticeSession();

  if (!isRunning || !isCompleted)
    throw new Error(
      "Unable to render an end session report if no session is active"
    );

  const avgAccuracyPerc = avgAccuracy * 100;

  const [best, worst] = useMemo(() => {
    const sorted = stats.sort((a, b) =>
      a.sessionAccuracy < b.sessionAccuracy ? 1 : -1
    );
    return [sorted[0], sorted.slice(-1)[0]] as const;
  }, [stats]);

  const { wordData: bestWordData } = useWordDefinition(best.word);
  const { wordData: worstWordData } = useWordDefinition(worst.word);

  const skeleton = <span className="inline-block skeleton h-3 w-18" />;

  const secondsPerWord = timeTakenSeconds / stats.length;
  return (
    <div className="flex flex-col h-full">
      <h1 className="text-3xl font-bold text-center mb-2 pb-2 border-b border-base-300">
        Session Complete! 🎉
      </h1>

      <div className="grow overflow-y-auto">
        <div className="flex flex-col gap-2">
          <WordCard>
            <div className="card-body flex flex-row">
              <div className="flex-1">
                <label className="text-base-content/75">Average Accuracy</label>
                <p className="mb-1">
                  <AnimatedNumber
                    className="text-3xl font-bold"
                    value={avgAccuracyPerc}
                  />
                  /100
                </p>
                <AccuracyComparer avgAccuracy={avgAccuracy} />
              </div>
              <div className="flex items-center">
                <RadialProgress size={4} progress={avgAccuracyPerc} />
              </div>
            </div>
          </WordCard>

          <h1 className="text-xs">Words You Practiced:</h1>
          <WordsComparison words={stats} />

          <h1 className="text-xs">Session Time:</h1>
          <WordCard>
            <div className="card-body">
              <label className="text-base-content/75">Time Taken</label>
              <div className="flex flex-row gap-2 items-center justify-between">
                <div>
                  <AnimatedNumber
                    value={timeTakenSeconds / 60}
                    className="text-4xl mr-1 font-bold"
                  />
                  minutes
                </div>
                <div>
                  <AnimatedNumber
                    value={secondsPerWord}
                    className="text-4xl mr-1 font-bold"
                  />
                  sec/word
                </div>
                <ClockIcon className="size-12" />
              </div>
            </div>
          </WordCard>
        </div>
      </div>

      <button className="btn btn-success w-full mt-3" onClick={closeSession}>
        <ArchiveBoxIcon className="size-4" /> Save and Exit
      </button>
    </div>
  );
};

const AccuracyComparer = ({ avgAccuracy }: { avgAccuracy: number }) => {
  const { data: prevAvgAccuracy } = useAverageSessionAccuracy();
  console.log("Rendering AccuracyComparer");
  if (!prevAvgAccuracy) return <p className="skeleton h-3 w-18" />;

  if (prevAvgAccuracy === "unavailable")
    return <div className="text-base-content">First Session</div>;
  if (avgAccuracy >= prevAvgAccuracy)
    return (
      <div className="text-success font-bold">
        <ArrowUpCircleIcon className="size-4 inline mr-1 mb-0.5" />
        Increasing
      </div>
    );
  return (
    <div className="text-error font-bold">
      <ArrowDownCircleIcon className="size-4 inline mr-1 mb-0.5" />
      Decreasing
    </div>
  );
};

type WordCardProps = {};
const WordCard = ({ children }: PropsWithChildren<WordCardProps>) => {
  return <div className="card card-sm card-default">{children}</div>;
};
