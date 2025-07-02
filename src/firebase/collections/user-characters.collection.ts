import {
  collection,
  FirestoreDataConverter,
  query,
  Timestamp,
} from "firebase/firestore";
import { auth, fireStore } from "../firebase.config";
import { CharFavourite } from "../../data/models";
import { safeToFirestore } from "../utils/toFirestore";
import { useState } from "react";

interface DbCharFavourite {
  /** The character itself */
  id: string;
  addedAt: Timestamp;
}

const converter: FirestoreDataConverter<CharFavourite, DbCharFavourite> = {
  fromFirestore: (snapshot, options) => {
    const dbo = snapshot.data(options) as DbCharFavourite;
    return {
      char: dbo.id,
      addedAt: dbo.addedAt.toDate(),
    };
  },
  toFirestore: (model) =>
    safeToFirestore<CharFavourite, DbCharFavourite>(model, {
      id: ({ char }) => char,
      addedAt: ({ addedAt }) => Timestamp.fromDate(addedAt),
    }),
};

export const getUserCharactersCollection = () => {
  if (!auth.currentUser)
    throw new Error("User must be authenticated to access user settings");
  return collection(
    fireStore,
    `user/${auth.currentUser.uid}/settings/characters`
  ).withConverter(converter);
};

export const useUserCharacters = () => {
  const [data, setData] = useState<CharFavourite>();
  const [isLoading, setIsLoading] = useState();
  const q = query(getUserCharactersCollection());
};
