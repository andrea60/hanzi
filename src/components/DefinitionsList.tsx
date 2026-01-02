import classNames from "classnames";

type Props = {
  definitions: string[];
  className?: string;
};
export const DefinitionsList = ({ definitions, className }: Props) => {
  return <p className={className}>{definitions.join(" - ")}</p>;
  return (
    <ul className={classNames("list-disc", className)}>
      {definitions.map((d, idx) => (
        <li key={idx}>{d}</li>
      ))}
    </ul>
  );
};
