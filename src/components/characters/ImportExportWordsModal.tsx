import {
  ArrowUpOnSquareIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { useFavourites } from "../../state/database/queries/useFavourites";
import { ErrorHandler } from "../ui/ErrorHandler";
import { useResettableState } from "../../utils/useResettableState";

export const ImportExportWordsModal = () => {
  const { data, isPending, isError, error } = useFavourites();
  const [userValue, setUserValue] = useResettableState(
    () => data?.join(","),
    [data]
  );

  if (isError) return <ErrorHandler error={error} />;
  if (isPending) return <p>Loading...</p>;

  const handleCopyClick = async () => {
    await navigator.clipboard.writeText(userValue!);
  };

  const isDifferent = userValue?.trim() !== data?.join(",").trim();

  return (
    <div className="flex flex-col gap-2">
      <textarea
        className="textarea w-full"
        onChange={(e) => setUserValue(e.target.value)}
      >
        {userValue}
      </textarea>
      <p className="text-xs">
        Here you can copy the full list of comma-separated bookmarked words or
        paste it and re-import them.
      </p>
      <div className="flex gap-2">
        <button className="btn btn-neutral" onClick={handleCopyClick}>
          <ClipboardDocumentIcon className="inline size-6" />
          Copy to Clipboard
        </button>
        <button className="btn btn-neutral flex-1" disabled={!isDifferent}>
          <ArrowUpOnSquareIcon className="size-6 inline" />
          Import
        </button>
      </div>
    </div>
  );
};
