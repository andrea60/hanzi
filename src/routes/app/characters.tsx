import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import debounce from "lodash.debounce";
import { useState, useCallback, useRef } from "react";
import { CharactersList } from "../../components/characters/CharactersList";
import { CharactersSearch } from "../../components/characters/CharactersSearch";
import { usePageTitle } from "../../utils/PageTitleProvider";

export const Route = createFileRoute("/app/characters")({
  component: RouteComponent,
});

function RouteComponent() {
  usePageTitle("Search Words", []);
  const [searchValue, setSearchValue] = useState<string>();

  const handleInputChange = useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value);
    }, 500),
    []
  );

  const handleInputClick = (
    evt: React.MouseEvent<HTMLInputElement, MouseEvent>
  ) => {
    evt.currentTarget.select();
  };
  const searchMode = !!searchValue?.trim();

  return (
    <>
      <label className="input w-full mb-2">
        <MagnifyingGlassIcon className="size-4" />
        <input
          type="search"
          lang="zh"
          className="grow"
          placeholder="Search character"
          onChange={handleInputChange}
          onClick={handleInputClick}
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
