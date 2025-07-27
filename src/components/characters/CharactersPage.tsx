import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { Outlet } from "@tanstack/react-router";
import debounce from "lodash.debounce";
import { useState, useCallback } from "react";
import { usePageTitle } from "../../utils/PageTitleProvider";
import { CharactersList } from "./CharactersList";
import { CharactersSearch } from "./CharactersSearch";
import { Bars3Icon } from "@heroicons/react/24/outline";

export const CharactersPage = () => {
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
      <label className="input w-full mb-2 grow">
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
};
