import { PropsWithChildren, useEffect, useState } from "react";
import setUpIndexedDb, { useIndexedDBStore } from "use-indexeddb";
import { IndexedDBConfig } from "use-indexeddb/dist/interfaces";
import { useAsyncEffect } from "../../utils/useAsyncEffect";
import { ModalContentProps, useModal } from "../../components/modal/useModal";
import { useQuery } from "@tanstack/react-query";

export const HanziDbName = "hanzi-dataset";
export const HanziCharacterStoreName = "characters";
export const HanziMetadataStoreName = "metadata";
export const HanziDbConfig: IndexedDBConfig = {
  databaseName: HanziDbName,
  version: 2,
  stores: [
    {
      name: HanziCharacterStoreName,
      id: { keyPath: "char", autoIncrement: false },
      indices: [],
    },
    {
      name: HanziMetadataStoreName,
      id: { keyPath: "version", autoIncrement: false },
      indices: [
        { name: "version", keyPath: "version", options: { unique: true } },
      ],
    },
  ],
};

export const HanziDataSetProvider = ({ children }: PropsWithChildren) => {
  const [isStoreReady, setIsStoreReady] = useState(false);
  const { openModal, closeModal } = useModal();
  const [requiresUpdate, setRequiresUpdate] = useState<boolean>();
  useEffect(() => {
    // Initilization of the IndexedDB database
    setUpIndexedDb(HanziDbConfig).then(() => setIsStoreReady(true));
  }, []);
  const metadataStore = useIndexedDBStore(HanziMetadataStoreName);
  const characterStore = useIndexedDBStore(HanziCharacterStoreName);

  useAsyncEffect(async () => {
    if (!isStoreReady) return;

    // fetch the metadata from the IndexedDB store
    const versions = await metadataStore.getAll();

    // at the moment, we don't support multiple versions so we just check for the presence of one version
    if (versions.length > 0) return;

    setRequiresUpdate(true);
    openModal({
      component: HanziDataSetUpdateModal,
      title: "Update Hanzi Dataset",
      mode: "dialog",
      force: true,
      componentProps: {},
    });
  }, [isStoreReady, metadataStore]);

  useQuery({
    queryKey: ["hanzi-dataset"],
    queryFn: async () => {
      const response = await fetch("/dataset-v1.0.0.json");

      if (!response.ok) {
        throw new Error("Failed to fetch hanzi dataset");
      }
      const data: { [key: string]: unknown } = await response.json();

      // this is highly inefficient but the indexedDB library does not support bulk insertions
      // it should be replaced with a raw indexedDB call
      const promises = Object.entries(data).map(([key, value]) => {
        characterStore.add({ strokes: value, char: key });
      });

      await Promise.all(promises);

      await metadataStore.add({ version: "1.0.0" });

      setRequiresUpdate(false);
      closeModal();

      return true;
    },
    enabled: isStoreReady && requiresUpdate,
  });

  return children;
};

export const HanziDataSetUpdateModal = (props: ModalContentProps<{}, {}>) => {
  return (
    <div>
      <p className="mb-2">
        Before using the app, we need to update your hanzi dataset
      </p>
      <p className="alert-warning">
        Please do not close this page while the dataset is being downloaded...
      </p>
    </div>
  );
};
