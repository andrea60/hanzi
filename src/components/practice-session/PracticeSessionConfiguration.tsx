import { useState } from "react";
import { Slider } from "../ui/Slider";
import { useFavouritesCount } from "../../state/database/queries/useFavourites";

export const PracticeSessionConfiguration = () => {
  const [numWords, setNumWords] = useState(0);
  const { data: favouritesCount } = useFavouritesCount();

  if (!favouritesCount) return <p>Loading...</p>;
  if (favouritesCount === 0)
    return (
      <div className="alert alert-error">
        You need to add at least one word to your practice list
      </div>
    );
  return (
    <>
      <h1 className="text-2xl">Start a practice session</h1>
      <Slider
        max={favouritesCount}
        min={1}
        step={1}
        value={numWords}
        onChange={setNumWords}
      />
    </>
  );
};
