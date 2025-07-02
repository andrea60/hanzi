import { useQuery } from "@tanstack/react-query";
import { hanziDb } from "../../data/hanzi-dataset/hanzi-dataset.db";

type Props = {
  search: string;
};
export const CharactersSearch = ({ search }: Props) => {
  const { data } = useQuery({
    queryKey: ["characters", search],
    queryFn: async () => {
      if (!search) return [];

      const matching = await hanziDb.pinyin
        .where("pinyin")
        .startsWith(search)
        .or("char")
        .equals("search")
        .toArray();

      return matching;
    },
  });
};

const searchCharacters = async (search: string) => {};
