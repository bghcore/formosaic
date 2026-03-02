import { isEmpty } from "@cxpui/common";
import { Label } from "@fluentui/react";
import React from "react";

export interface INominatedKeyProjects {
  NominatedAzureSolution: string;
  NominatedAzureScenarios: string[];
}

interface IListTableControlProps {
  readonly nominatedKeyProjects: INominatedKeyProjects[] | undefined;
  readonly columnCount: number | undefined;
  readonly labelClassName?: string;
  readonly valueClassName?: string;
  readonly className?: string;
  readonly label?: string;
}

export const ListTableControl = (props: IListTableControlProps) => {
  const [dataRowControlsList, setdataRowControlsList] = React.useState(undefined);
  React.useEffect(() => {
    if (!isEmpty(props.nominatedKeyProjects)) {
      const dataRowControls = [];
      for (let i = 0; props.nominatedKeyProjects && i < props.nominatedKeyProjects.length; i = i + props.columnCount) {
        const items = props.nominatedKeyProjects.slice(i, i + props.columnCount);
        dataRowControls.push(<ListRowControl nominatedKeyProjects={items} key={i} />);
      }
      setdataRowControlsList(dataRowControls);
    }
  }, [props.columnCount, props.nominatedKeyProjects]);

  return (
    <div className={props.className || ""}>
      {props.label && <Label className={props.labelClassName || ""}>{props.label}</Label>}
      <div className={props.valueClassName || ""}>{dataRowControlsList ? dataRowControlsList : <>-</>}</div>
    </div>
  );
};

interface IListRowControlProps {
  readonly nominatedKeyProjects: INominatedKeyProjects[] | undefined;
}
/*
 * Used only in the parent control ListTableControl above
 */
const ListRowControl = (props: IListRowControlProps) => {
  return (
    <div className="flexBox">
      {props.nominatedKeyProjects.map((project: INominatedKeyProjects, i: number) => {
        return (
          <div className="halfWidth" key={`${project.NominatedAzureSolution}-${i}`}>
            <Label>{project.NominatedAzureSolution}</Label>
            {project.NominatedAzureScenarios.map((scenario: string, index: number) => (
              <Label className="readOnlyField" key={`${scenario}-${index}`}>
                {scenario}
              </Label>
            ))}
          </div>
        );
      })}
    </div>
  );
};
