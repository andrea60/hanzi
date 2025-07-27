import { AccuracyChart } from "./AccuracyChart";
import { BestWordsCard } from "./BestWordsCard";
import { LastSessionCard } from "./LastSessionCard";
import { WordsCountCard } from "./WordsCountCard";
import { WorstWordsCard } from "./WorstWordsCard";

export const DashboardPage = () => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-2">
      <WordsCountCard />
      <LastSessionCard />
      <div className="card card-sm card-default col-span-2">
        <div className="card-body">
          <h1>Accuracy Trend</h1>
          <AccuracyChart height={100} />
        </div>
      </div>
      <div className="col-span-2">
        <BestWordsCard />
      </div>
      <div className="col-span-2">
        <WorstWordsCard />
      </div>
    </div>
  );
};
