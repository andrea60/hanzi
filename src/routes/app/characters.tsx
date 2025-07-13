import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import debounce from "lodash.debounce";
import { useState, useCallback } from "react";
import { CharactersList } from "../../components/characters/CharactersList";
import { CharactersSearch } from "../../components/characters/CharactersSearch";

export const Route = createFileRoute("/app/characters")({
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
      <Outlet />
    </>
  );
}
