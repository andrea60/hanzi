import { PropsWithChildren, useState } from "react";
import { useAsyncEffect } from "../../utils/useAsyncEffect";
import { ModalContentProps, useModal } from "../../components/modal/useModal";
import { useQuery } from "@tanstack/react-query";
import { db, DictionaryRow, StrokeDataRow } from "./database.db";
import { create } from "zustand";
import { showToast } from "../../components/toastr/useToast";
import { fetchWithProgress } from "../../utils/fetchWithProgress";

export type RemoteDataSet = {
  version: number;
  strokes: Record<
    string,
    {
      strokes: unknown;
    }
  >;
  dictionary: Record<
    string,
    {
      pinyin: string[];
      defs: string[];
    }
  >;
};

type HanziDbState = {
  requiresUpdate: boolean;
  isUpdating: boolean;
  downloadProgress: number;
  downloadState?: string;

  setRequiresUpdate: (value: boolean) => void;
  setIsUpdating: (value: boolean) => void;
  setDownloadProgress: (value: number, state: string) => void;
};
const useHanziDbState = create<HanziDbState>((set) => ({
  requiresUpdate: false,
  isUpdating: false,
  downloadProgress: 0,

  setRequiresUpdate: (value: boolean) => set({ requiresUpdate: value }),
  setIsUpdating: (value: boolean) => set({ isUpdating: value }),
  setDownloadProgress: (value, downloadState) =>
    set({ downloadProgress: value, downloadState }),
}));

export const HanziDataSetProvider = ({ children }: PropsWithChildren) => {
  const { openModal, closeModal } = useModal();
  const [latestServerVersion, setLatestServerVersion] = useState<string>();
  const { setRequiresUpdate, setIsUpdating, setDownloadProgress } =
    useHanziDbState();

  const startDownload = () => {
    setIsUpdating(true);
    refetch();
  };

  const { data: remoteVersion } = useQuery({
    queryKey: ["hanzi-dataset", "version"],
    retry: true,
    queryFn: async () => {
      const response = await fetch("/api/dataset/version");
      if (response.status !== 200)
        throw new Error(
          `Error status code returned while fetching remote dataset version: ${response.status}, ${response.statusText}`
        );
      const { version } = (await response.json()) as { version: number };

      return version;
    },
  });

  useAsyncEffect(async () => {
    if (!remoteVersion) return;
    // fetch the metadata from the IndexedDB store
    const [localVersionRow] = await db.versions.toArray();

    // if our local version is greater than remote stop
    if (localVersionRow && localVersionRow.version >= remoteVersion) return;

    // otherwise an update is required
    setRequiresUpdate(true);
    openModal({
      component: HanziDataSetUpdateModal,
      title: "Update Hanzi Dataset",
      mode: "dialog",
      force: true,
      componentProps: { startDownload },
    });
  }, [remoteVersion]);

  const { refetch } = useQuery({
    queryKey: ["hanzi-dataset"],
    retry: true,
    queryFn: async () => {
      setDownloadProgress(0, "Downloading");
      const data = await fetchWithProgress<RemoteDataSet>(
        "/api/dataset/latest.json.gz",
        (p) => setDownloadProgress(p, "Downloading")
      );

      setDownloadProgress(1, "Removing old data");
      await db.strokeData.clear();
      await db.dictionary.clear();

      setDownloadProgress(1, "Parsing data");
      const strokeDataRows: StrokeDataRow[] = Object.entries(data.strokes).map(
        ([char, row]) => ({
          char,
          strokes: row.strokes,
        })
      );

      const dictionaryRows: DictionaryRow[] = Object.entries(
        data.dictionary
      ).map(([word, row]) => ({
        word,
        definitions: row.defs,
        pinyin: row.pinyin,
        searchablePinyin: row.pinyin.map(normalizePinyin).join(", "),
      }));

      setDownloadProgress(1, "Saving data");
      await db.strokeData.bulkAdd(strokeDataRows);
      await db.dictionary.bulkAdd(dictionaryRows);

      await db.versions.clear();
      await db.versions.add({ version: data.version, date: new Date() });

      showToast({
        type: "time",
        severity: "success",
        title: "Dataset Updated Successfully",
        content:
          "Your dataset on this device has been updated, you can now use the app.",
      });

      setRequiresUpdate(false);
      closeModal();

      setIsUpdating(false);

      return true;
    },
    enabled: false,
  });

  return children;
};

export const HanziDataSetUpdateModal = (
  props: ModalContentProps<{}, { startDownload: () => void }>
) => {
  const { isUpdating, downloadProgress, downloadState } = useHanziDbState();
  const downloadPerc = Math.round(downloadProgress * 100);
  return (
    <div>
      <p className="mb-2">
        Before using the app, we need to update your dataset
      </p>
      <button
        className="btn btn-neutral w-full my-2"
        disabled={isUpdating}
        onClick={props.startDownload}
      >
        {isUpdating ? (
          <>
            <span className="loading loading-ring loading-lg" /> {downloadState}
            ...
          </>
        ) : (
          <>Download Now</>
        )}
      </button>
      {isUpdating && (
        <progress
          className="progress progress-info w-full"
          value={downloadPerc}
          max={100}
        />
      )}
    </div>
  );
};

function normalizePinyin(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
