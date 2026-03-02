import { CxpAuthContext, IHookFieldSharedProps } from "@cxpui/commoncontrols";
import { TextField } from "@fluentui/react";
import React from "react";
import { CleanStatusReasonDescription, FieldClassName, GetFieldDataTestId } from "../Helpers";
import { HookInlineFormStrings } from "../Strings";

interface IHookStatusReasonDescriptionProps {}

const HookStatusReasonDescription = (props: IHookFieldSharedProps<IHookStatusReasonDescriptionProps>) => {
  const { fieldName, programName, entityType, entityId, value, meta, error, setFieldValue } = props;

  const onChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
    if (newValue && newValue.trim().length > 0) {
      setFieldValue(
        fieldName,
        `${new Date().toDateString()}: ${newValue} ${HookInlineFormStrings.by} ${upn}.`,
        false,
        3000
      );
    } else {
      setFieldValue(fieldName, undefined, false, 3000);
    }
  };

  const authContext = React.useContext(CxpAuthContext);
  const upn = authContext.getUserUpn();

  return (
    <div>
      <span>{new Date().toDateString()}:</span>
      <TextField
        className={FieldClassName("hook-text-area", error)}
        value={value ? CleanStatusReasonDescription(`${value}`) : ""}
        id={fieldName}
        multiline
        autoComplete="off"
        onChange={onChange}
        data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
        {...meta}
      />
      <span>{upn}.</span>
    </div>
  );
};

export default HookStatusReasonDescription;
