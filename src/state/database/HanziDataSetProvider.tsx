import { PropsWithChildren } from "react";
import { useAsyncEffect } from "../../utils/useAsyncEffect";
import { ModalContentProps, useModal } from "../../components/modal/useModal";
import { useQuery } from "@tanstack/react-query";
import { db, DictionaryRow, StrokeDataRow } from "./database.db";
import { create } from "zustand";
import { showToast } from "../../components/toastr/useToast";
import { fetchWithProgress } from "../../utils/fetchWithProgress";

export type RemoteDataSet = {
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
  const { setRequiresUpdate, setIsUpdating, setDownloadProgress } =
    useHanziDbState();

  const startDownload = () => {
    setIsUpdating(true);
    refetch();
  };

  useAsyncEffect(async () => {
    // fetch the metadata from the IndexedDB store
    const versions = await db.versions.count();

    // at the moment, we don't support multiple versions so we just check for the presence of one version
    if (versions > 0) return;

    setRequiresUpdate(true);
    openModal({
      component: HanziDataSetUpdateModal,
      title: "Update Hanzi Dataset",
      mode: "dialog",
      force: true,
      componentProps: { startDownload },
    });
  }, []);

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

      await db.versions.add({ version: "1.0.0", date: new Date() });

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
