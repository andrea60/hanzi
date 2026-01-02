import { usePageTitle } from "../../utils/PageTitleProvider";
import { LastSessionCard } from "./LastSessionCard";
import { WordsCountCard } from "./WordsCountCard";

export const DashboardPage = () => {
  usePageTitle("Dashboard", []);
  return (
    <div className="grid grid-cols-2 gap-4 mb-2">
      <WordsCountCard />
      <LastSessionCard />
    </div>
  );
};
