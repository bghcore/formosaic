import { IHookFieldSharedProps } from "../../Interfaces/IHookFieldSharedProps";
import React from "react";
import {
  INominatedKeyProjects,
  ListTableControl,
} from "../../Components/ListTableControl";

interface IHookReadOnlyListTableProps {
  columnCount?: number;
}

const HookReadOnlyListTable = (
  props: IHookFieldSharedProps<IHookReadOnlyListTableProps>
) => {
  const { value, meta } = props;

  return (
    <ListTableControl
      className="hook-read-only-list-table"
      nominatedKeyProjects={(value as INominatedKeyProjects[]) || []}
      columnCount={meta?.columnCount}
    />
  );
};

export default HookReadOnlyListTable;
