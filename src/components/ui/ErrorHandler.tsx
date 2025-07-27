import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { ClipboardDocumentIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { showToast } from "../toastr/useToast";

type Props = {
  error: Error | undefined | null;
};
export const ErrorHandler = ({ error }: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  if (!error) return;
  const errorStack = error.stack
    ?.split("\n")
    .map((s) => <span className="block">{s}</span>);

  const handleCopyButton = async (
    evt: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    evt.stopPropagation();

    if (!error.stack) return;

    await navigator.clipboard.writeText(error.stack);

    showToast({
      type: "time",
      content: "Error copied to clipboard",
      severity: "success",
    });
  };
  return (
    <div role="alert" className="alert alert-error alert-outline justify-start">
      <div className="w-full col-span-2">
        <h1
          onClick={() => setIsCollapsed((x) => !x)}
          className="w-full flex justify-between items-center"
        >
          <span>
            <span className="font-bold mr-1">
              <ExclamationCircleIcon className="size-6 inline" /> An error
              occured:
            </span>
            {error.message}
          </span>

          <button className="btn btn-sm btn-ghost" onClick={handleCopyButton}>
            <ClipboardDocumentIcon className="size-5" />
          </button>
        </h1>

        {!isCollapsed && (
          <div className="mt-2 overflow-x-scroll w-full text-xs whitespace-nowrap">
            {errorStack}
          </div>
        )}
      </div>
    </div>
  );
};
