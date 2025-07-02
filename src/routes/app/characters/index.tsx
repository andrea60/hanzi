import {
  MagnifyingGlassCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { hanziDb } from "../../../data/hanzi-dataset/hanzi-dataset.db";
import { CharactersList } from "../../../components/characters/CharactersList";

export const Route = createFileRoute("/app/characters/")({
  component: RouteComponent,
});

const PAGE_SIZE = 20; // Number of characters to fetch per page

function RouteComponent() {
  const [searchValue, setSearchValue] = useState<string>();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  return (
    <div>
      <label className="input">
        <MagnifyingGlassIcon className="size-4" />
        <input type="search" className="grow" placeholder="Search character" />
      </label>
      <CharactersList />
    </div>
  );
}
