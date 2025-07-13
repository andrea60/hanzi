import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { createFileRoute } from "@tanstack/react-router";
import React, { useCallback, useState } from "react";
import { CharactersSearch } from "../../../components/characters/CharactersSearch";
import debounce from "lodash.debounce";
import { CharactersList } from "../../../components/characters/CharactersList";
export const Route = createFileRoute("/app/characters/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [searchValue, setSearchValue] = useState<string>();

  const handleInputChange = useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value);
    }, 500),
    []
  );

  const searchMode = !!searchValue?.trim();

  return (
    <>
      <label className="input w-full mb-2">
        <MagnifyingGlassIcon className="size-4" />
        <input
          type="search"
          className="grow"
          placeholder="Search character"
          onChange={handleInputChange}
        />
      </label>
      {searchMode ? (
        <CharactersSearch search={searchValue} />
      ) : (
        <CharactersList />
      )}
    </>
  );
}
