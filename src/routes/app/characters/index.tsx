import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { createFileRoute } from "@tanstack/react-router";
import React, { useCallback, useState } from "react";
import { CharactersSearch } from "../../../components/characters/CharactersSearch";
import debounce from "lodash.debounce";
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

  return (
    <div>
      <label className="input">
        <MagnifyingGlassIcon className="size-4" />
        <input
          type="search"
          className="grow"
          placeholder="Search character"
          onChange={handleInputChange}
        />
      </label>
      <CharactersSearch search={searchValue} />
    </div>
  );
}
