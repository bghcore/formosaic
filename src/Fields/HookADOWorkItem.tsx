import { IHookFieldSharedProps } from "../Interfaces/IHookFieldSharedProps";

import { GetADOWorkItem, IADOWorkItem } from "@cxpui/service";
import { IconButton, ProgressIndicator, TextField } from "@fluentui/react";
import React from "react";
import { ADOWorkItem } from "../Components/ADOWorkItem";
import ReadOnlyText from "../Components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../Helpers";
import { HookInlineFormStrings } from "../Strings";

interface IHookADOWorkItemProps {
  hideRemoveButton?: boolean;
}

const HookADOWorkItem = (props: IHookFieldSharedProps<IHookADOWorkItemProps>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, meta, error, setFieldValue } = props;

  const [adoWorkItem, setAdoWorkItem] = React.useState<IADOWorkItem>();
  const [urlText, setUrlText] = React.useState<string>(value ? String(value) : undefined);
  const [isFetching, setIsFetching] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<boolean>(false);

  const formatUrl = (url: string) => {
    const lastChar = url.slice(-1); // API expects trailing slash
    return lastChar === "/" ? url : `${url}/`;
  };

  React.useEffect(() => {
    setAdoWorkItem(undefined);
    setIsError(false);
    if (urlText) {
      setIsFetching(true);
      GetADOWorkItem(programName, formatUrl(urlText))
        .then(response => {
          if (response.isSuccess) {
            setAdoWorkItem(response.result);
            setFieldValue(fieldName, formatUrl(urlText));
            setIsFetching(false);
          } else {
            setIsFetching(false);
            setIsError(true);
            setFieldValue(fieldName, "");
          }
        })
        .catch(error => {
          setIsFetching(false);
          setIsError(true);
          setFieldValue(fieldName, "");
        });
    } else {
      setIsFetching(false);
    }
  }, [urlText]);

  React.useEffect(() => {
    if (value && !urlText) {
      setUrlText(String(value));
    }
  }, [value]);

  const onChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
    setUrlText(newValue || undefined);
  };

  const clearWorkItem = () => {
    setAdoWorkItem(undefined);
    setFieldValue(fieldName, "");
    setUrlText("");
  };

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={String(value)} />
  ) : (
    <div className="hook-ado-work-item">
      {adoWorkItem ? (
        <div className="selected-work-item">
          <ADOWorkItem
            workItemType={adoWorkItem.ADOWorkItemType}
            workItemId={adoWorkItem.ADOWorkItemId}
            workItemTitle={adoWorkItem.ADOEntityTitle}
            workItemUrl={adoWorkItem.ADOEntityLink}
          />
          <IconButton
            iconProps={{ iconName: "Cancel" }}
            data-is-focusable="true"
            data-is-sub-focuszone="true"
            data-selection-index="0"
            className="remove-button"
            onClick={clearWorkItem}
            tabIndex={0}
            title={HookInlineFormStrings.clickToClear}
            aria-label={`${adoWorkItem.ADOWorkItemID} ${HookInlineFormStrings.clear}`}
          />
        </div>
      ) : (
        <TextField
          className={FieldClassName("url-input", error)}
          autoComplete="off"
          value={urlText}
          onChange={onChange}
          disabled={isFetching}
          errorMessage={isError ? "Invalid URL" : undefined}
          description={HookInlineFormStrings.pasteUrl}
          data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
          {...meta}
        />
      )}
      {isFetching && <ProgressIndicator />}
    </div>
  );
};

export default HookADOWorkItem;
