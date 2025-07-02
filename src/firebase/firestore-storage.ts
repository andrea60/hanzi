import type { PersistStorage, StorageValue } from "zustand/middleware";
import { auth, fireStore } from "./firebase.config";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";

export const firestoreStorage = <
  TState extends { [x: string]: any },
  TStorage extends { [x: string]: any } = TState,
>(
  collectionPath: string,
  toStorage: (state: TState) => TStorage = (x) => x as unknown as TStorage,
  fromStorage: (storage: TStorage) => TState = (x) => x as unknown as TState
): PersistStorage<TState> => {
  return {
    getItem: async (_: string): Promise<StorageValue<TState> | null> => {
      if (!auth.currentUser) return null;
      const docRef = doc(fireStore, auth.currentUser.uid, collectionPath);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        return { state: fromStorage(snapshot.data() as TStorage), version: 1 };
      }

      return null;
    },
    setItem: async (_: string, value: StorageValue<TState>): Promise<void> => {
      if (!auth.currentUser) return;

      const docRef = doc(fireStore, auth.currentUser.uid, collectionPath);
      await setDoc(docRef, toStorage(value.state), { merge: true });
    },

    removeItem: async (_: string): Promise<void> => {
      if (!auth.currentUser) return;

      const docRef = doc(fireStore, auth.currentUser.uid, collectionPath);
      await deleteDoc(docRef);
    },
  };
};
