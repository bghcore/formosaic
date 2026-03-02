import { IHookFieldSharedProps, getPeopleApi } from "@cxpui/commoncontrols";
import { renderItemColumn } from "@cxpui/dux";
import { ElxTable, IElxTableProps } from "@elixir/components";
import { DetailsListLayoutMode, IColumn, SelectionMode } from "@fluentui/react";
import React from "react";

interface IHookArrayFieldAsTableProps extends IElxTableProps {}

const HookReadOnlyArrayFieldAsTable = (props: IHookFieldSharedProps<IHookArrayFieldAsTableProps>) => {
  const { value, meta } = props;

  return (
    <ElxTable
      className="hook-array-field-as-table"
      selectionMode={SelectionMode.none}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items={(value as any[]) || []}
      layoutMode={DetailsListLayoutMode.fixedColumns}
      columns={meta.columns}
      onRenderItemColumn={(item?: unknown, index?: number, column?: IColumn) =>
        renderItemColumn(item, index, column, getPeopleApi())
      }
      {...meta}
    />
  );
};

export default HookReadOnlyArrayFieldAsTable;
