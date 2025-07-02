import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import { fireStore } from "../../firebase/firebase.config";
import {
  count,
  endAt,
  getCountFromServer,
  getDocs,
  orderBy,
  query,
  startAt,
} from "firebase/firestore";
import { getUserCharactersCollection } from "../../firebase/collections/user-characters.collection";
import { hanziDb } from "../../data/hanzi-dataset/hanzi-dataset.db";
import { toMap } from "../../utils/toMap";

const PAGE_SIZE = 30;

export const CharactersList = () => {
  const { data, hasNextPage, hasPreviousPage, isLoading } = useInfiniteQuery({
    queryKey: ["characters"],
    queryFn: async ({ pageParam = 0 }) => {
      return getPaginatedUserCharacters(pageParam, PAGE_SIZE);
    },
    initialPageParam: 0,
    getNextPageParam: (prevPage) => {
      const nextPage = prevPage.offset + PAGE_SIZE;
      if (nextPage < prevPage.totalCount) {
        return nextPage;
      }
      return null;
    },
  });

  return (
    <div className="grow flex flex-col">
      {data?.pages.map((page) => (
        <React.Fragment key={page.offset}>
          {page.rows.map((hanzi) => (
            <div key={hanzi.char}>
              {hanzi.char} ({hanzi.pinyin})
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

const getPaginatedUserCharacters = async (offset: number, take: number) => {
  const baseQuery = query(getUserCharactersCollection(), orderBy("addedAt"));
  const paginatedQuery = query(
    baseQuery,
    startAt(offset),
    endAt(offset + take - 1)
  );

  const [totalCount, docs] = await Promise.all([
    getCountFromServer(baseQuery),
    getDocs(paginatedQuery),
  ]);

  const favCharacters = docs.docs.map((doc) => doc.data());

  const charsData = toMap(
    await hanziDb.pinyin.bulkGet(favCharacters.map((c) => c.char)),
    (row) => row.char
  );

  return {
    offset,
    totalCount: totalCount.data().count,
    rows: favCharacters.map((f) => ({ ...f, ...charsData.get(f.char) })),
  };
};
