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
import { db } from "../../data/database.db";
import { toMap } from "../../utils/toMap";

const PAGE_SIZE = 30;

export const CharactersList = () => {
  const { data, hasNextPage, hasPreviousPage, isLoading } = useInfiniteQuery({
    queryKey: ["characters"],
    queryFn: async ({ pageParam = 0 }) => {
      return [];
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
