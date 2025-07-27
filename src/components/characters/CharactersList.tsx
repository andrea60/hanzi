import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { db } from "../../state/database/database.db";
import { WordCard } from "./WordCard";
import {
  ArrowDownOnSquareIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useModal } from "../modal/useModal";
import { ImportExportWordsModal } from "./ImportExportWordsModal";
import { useFavouritesPaginated } from "../../state/database/queries/useFavourites";

export const CharactersList = () => {
  const { openModal } = useModal();
  const { data, hasNextPage, fetchNextPage, isLoading } =
    useFavouritesPaginated();

  const flatData = useMemo(() => data?.pages.flatMap((p) => p.words), [data]);

  const totalCount = useMemo(() => data?.pages[0]?.totalCount, [data]);

  const handleImportClick = () => {
    openModal({
      title: "Import\\Export",
      component: ImportExportWordsModal,
      componentProps: {},
      fullWidth: true,
      mode: "dialog",
    });
  };

  if (isLoading) return <div>Loading...</div>;

  const isEmpty = flatData && flatData.length == 0;

  if (isEmpty) {
    return (
      <div role="alert" className="mt-6 flex flex-row gap-2 ">
        <InformationCircleIcon className="size-10 justify-self-start" />

        <div>
          <p className="">Empty study list</p>
          <p className="text-xs">
            Use the search bar above to search characters and add them to your
            study list
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grow flex flex-col gap-2">
      {
        <p className="flex justify-between items-center">
          You saved {totalCount} words:
          <span
            className="link link-accent text-xs whitespace-nowrap"
            onClick={handleImportClick}
          >
            <ArrowDownOnSquareIcon className="size-4 inline" /> Import\Export
          </span>
        </p>
      }
      {flatData?.map((word) => <WordCard key={word.word} word={word} />)}

      {hasNextPage && (
        <button
          className="btn btn-ghost w-full"
          onClick={() => fetchNextPage()}
        >
          Load more...
        </button>
      )}
    </div>
  );
};
