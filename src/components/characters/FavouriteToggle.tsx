import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

type Props = {
  isFavourite: boolean;
  onChange: (isFavourite: boolean) => void;
};
export const FavouriteToggle = ({ isFavourite, onChange }: Props) => {
  const handleClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();
    onChange(!isFavourite);
  };
  if (isFavourite)
    return (
      <StarSolid className="size-6 text-base-content" onClick={handleClick} />
    );

  return (
    <StarOutline className="size-6 text-base-content" onClick={handleClick} />
  );
};
