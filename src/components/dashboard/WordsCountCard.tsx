import { useFavouritesCount } from "../../state/database/queries/useFavourites";
import { AnimatedNumber } from "../ui/AnimatedNumber";

export const WordsCountCard = () => {
  const { data } = useFavouritesCount();
  const skeleton = (
    <div className="h-10 flex items-center">
      <div className="skeleton w-20 h-4" />
    </div>
  );
  return (
    <div className="card card-sm card-default">
      <div className="card-body">
        <h1>Words Learned</h1>
        {data ? (
          <div>
            <AnimatedNumber value={data} className="text-4xl font-bold mr-2" />{" "}
            words
          </div>
        ) : (
          skeleton
        )}
      </div>
    </div>
  );
};
