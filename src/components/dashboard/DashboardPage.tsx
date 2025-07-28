import { usePageTitle } from "../../utils/PageTitleProvider";
import { AccuracyChart } from "./AccuracyChart";
import { BestWordsCard } from "./BestWordsCard";
import { LastSessionCard } from "./LastSessionCard";
import { WordsCountCard } from "./WordsCountCard";
import { WorstWordsCard } from "./WorstWordsCard";

export const DashboardPage = () => {
  usePageTitle("Dashboard", []);
  return (
    <div className="grid grid-cols-2 gap-4 mb-2">
      <WordsCountCard />
      <LastSessionCard />
      <div className="col-span-2">
        <AccuracyChart height={100} />
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
