import {
  ArrowUpOnSquareIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { useFavourites } from "../../state/database/queries/useFavourites";
import { ErrorHandler } from "../ui/ErrorHandler";
import { useResettableState } from "../../utils/useResettableState";
import { showToast } from "../toastr/useToast";
import { useFavouriteImport } from "../../state/database/commands/useFavouriteImport";

export const ImportExportWordsModal = () => {
  const { data, isPending, isError, error } = useFavourites();
  const {
    mutateAsync: importAsync,
    isPending: importing,
    error: importError,
  } = useFavouriteImport();
  const [userValue, setUserValue] = useResettableState(
    () => data?.join(","),
    [data]
  );

  if (isError) return <ErrorHandler error={error} />;
  if (isPending) return <p>Loading...</p>;

  const handleCopyClick = async () => {
    await navigator.clipboard.writeText(userValue!);
    showToast({
      type: "time",
      severity: "success",
      content: "Copied to clipboard",
    });
  };

  const handleImportClick = () => {
    if (!userValue) return;
    // normalize the input value
    const words = userValue
      .replace(/，/g, ",") // replace Chinese comma with English comma
      .split(",")
      .map((word) => word.trim())
      .filter((word) => word.length > 0);

    importAsync(words);
  };

  const isDifferent = userValue?.trim() !== data?.join(",").trim();

  return (
    <div className="flex flex-col gap-2">
      <textarea
        className="textarea w-full"
        onChange={(e) => setUserValue(e.target.value)}
        disabled={importing}
        value={userValue}
      />

      <p className="text-xs">
        Here you can copy the full list of comma-separated bookmarked words or
        paste it and re-import them.
      </p>
      {importError && <p className="text-error">{importError.message}</p>}
      <div className="flex gap-2">
        <button className="btn btn-neutral" onClick={handleCopyClick}>
          <ClipboardDocumentIcon className="inline size-6" />
          Copy to Clipboard
        </button>
        <button
          className="btn btn-neutral flex-1"
          disabled={!isDifferent || importing}
          onClick={handleImportClick}
        >
          <ArrowUpOnSquareIcon className="size-6 inline" />
          Import
        </button>
      </div>
    </div>
  );
};
