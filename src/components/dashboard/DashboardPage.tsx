import { usePageTitle } from "../../utils/PageTitleProvider";
import { AdaptiveDailyTargetCard } from "./AdaptiveDailyTargetCard";
import { LastSessionCard } from "./LastSessionCard";
import { PracticeLeftCard } from "./PracticeLeftCard";
import { ProgressCard } from "./ProgressCard";
import { WordsCountCard } from "./WordsCountCard";

export const DashboardPage = () => {
  usePageTitle("Dashboard", []);
  return (
    <div className="grid grid-cols-2 gap-4 mb-2">
      <h1 className="text-sm col-span-2 font-bold">Your weekly progress</h1>
      <ProgressCard className="col-span-2" />
      <PracticeLeftCard />
      <AdaptiveDailyTargetCard />
      <h1 className="text-sm col-span-2 font-bold">Your learning so far</h1>
      <WordsCountCard />
      <LastSessionCard />
    </div>
  );
};
