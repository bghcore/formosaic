import React from "react";
import { Icon, Link } from "@fluentui/react";
import { isEmpty } from "@cxpui/common";

interface IADOWorkItemProps {
  /**
   * ADO work item id
   */
  workItemId: number;

  /**
   * ADO work item title
   */
  workItemTitle: string;

  /**
   * ADO work item type
   */
  workItemType: string;

  /**
   * ADO work item url
   */
  workItemUrl: string;

  /**
   * custom class name
   */
  className?: string;
}

interface WorkItemIcon {
  /**
   * Work item icon
   */
  iconName: string;

  /**
   * Work item icon color
   */
  className: string;

  /**
   * Work item type
   */
  workItemType: string;
}

export const ADOWorkItem = (props: IADOWorkItemProps) => {
  const { workItemType, workItemId, workItemTitle, workItemUrl } = props;
  const [workItemIcon, setWorkItemIcon] = React.useState<WorkItemIcon>();

  React.useEffect(() => {
    if (!isEmpty(workItemType)) {
      switch (workItemType) {
        case "Feature":
          setWorkItemIcon({
            iconName: "Trophy",
            className: "work-item-feature",
            workItemType: "Feature"
          });
          break;
        case "Product Backlog Item":
          setWorkItemIcon({
            iconName: "PageListMirroredSolid",
            className: "work-item-pbi",
            workItemType: "PBI"
          });
          break;
        case "Task":
          setWorkItemIcon({ iconName: "TaskSolid", className: "work-item-task", workItemType: "Task" });
          break;
        case "Bug":
          setWorkItemIcon({ iconName: "LadybugSolid", className: "work-item-bug", workItemType: "Bug" });
          break;
        case "Epic":
          setWorkItemIcon({ iconName: "CrownSolid", className: "work-item-epic", workItemType: "Epic" });
          break;
        default:
          setWorkItemIcon({
            iconName: "WorkItem",
            className: "",
            workItemType: workItemType
          });
      }
    }
  }, [workItemType]);

  const title = workItemIcon
    ? `${workItemIcon.workItemType} ${workItemId}${workItemTitle ? `: ${workItemTitle}` : ""}`
    : "";
  return (
    <>
      {workItemIcon && (
        <Link className="ado-work-item" title={title} target="_blank" href={workItemUrl}>
          <Icon className={`work-item-icon ${workItemIcon.className}`} iconName={workItemIcon.iconName} />
          <span className="work-item-title">{title}</span>
        </Link>
      )}
    </>
  );
};
