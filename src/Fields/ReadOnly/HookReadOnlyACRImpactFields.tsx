import { IHookFieldSharedProps, getPeopleApi } from "@cxpui/commoncontrols";
import { renderItemColumn } from "@cxpui/dux";
import { IACXNomination } from "@cxpui/service";
import { ElxTable, IElxTableProps } from "@elixir/components";
import { DetailsListLayoutMode, IColumn, SelectionMode } from "@fluentui/react";
import React from "react";
import ACXNominationStrings from "../../../../Strings/ACXNominationStrings";

interface IHookACRImpactFieldsProps extends IElxTableProps {}

interface IACRImpact {
  IdType?: string;
  IdNumber?: string;
  IdValue?: string;
}

const HookReadOnlyACRImpactFields = (props: IHookFieldSharedProps<IHookACRImpactFieldsProps>) => {
  const { value, meta } = props;

  const [itemsFieldData, setItemsFieldData] = React.useState<IACRImpact[]>([]);

  React.useEffect(() => {
    const acxImpactData = [] as IACRImpact[];
    const acxNomination = (Array.isArray(value) && value[0]) || ({} as IACXNomination);
    const { opportunityId, msxId, engagementId } = ACXNominationStrings.labels;
    acxImpactData.push({
      IdType: msxId,
      IdNumber: acxNomination.MsxId || "-",
      IdValue: acxNomination.MsxIdValue || "-"
    });
    acxImpactData.push({
      IdType: engagementId,
      IdNumber: acxNomination.EngagementId || "-",
      IdValue: acxNomination.EngagementIdValue || "-"
    });
    acxImpactData.push({
      IdType: opportunityId,
      IdNumber: acxNomination.OpportunityId || "-",
      IdValue: acxNomination.OpportunityIdValue || "-"
    });
    setItemsFieldData(acxImpactData);
  }, [value]);

  return (
    <ElxTable
      selectionMode={SelectionMode.none}
      items={itemsFieldData || []}
      layoutMode={DetailsListLayoutMode.fixedColumns}
      columns={meta?.columns}
      onRenderItemColumn={(item?: unknown, index?: number, column?: IColumn) =>
        renderItemColumn(item, index, column, getPeopleApi())
      }
      {...meta}
    />
  );
};

export default HookReadOnlyACRImpactFields;
