import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

type Props = {
  isFavourite: boolean;
  onChange: (isFavourite: boolean) => void;
};
export const FavouriteToggle = ({ isFavourite, onChange }: Props) => {
  if (isFavourite)
    return (
      <StarSolid
        className="size-6 text-base-content"
        onClick={() => onChange(false)}
      />
    );

  return (
    <StarOutline
      className="size-6 text-base-content"
      onClick={() => onChange(true)}
    />
  );
};
