import { isEmpty } from "@cxpui/common";
import { IHookFieldSharedProps } from "../../Interfaces/IHookFieldSharedProps";

import React from "react";
import { useFormContext } from "react-hook-form";
import ReadOnlyText, { IReadOnlyFieldProps } from "../../Components/ReadOnlyText";

interface IHookReadOnlyCumulativeNumberProps extends IReadOnlyFieldProps {
  dependencyFields?: string[];
}

const HookReadOnlyCumulativeNumber = (props: IHookFieldSharedProps<IHookReadOnlyCumulativeNumberProps>) => {
  const { fieldName, meta } = props;

  const { formState, getValues } = useFormContext();

  const [value, setVaule] = React.useState<number>();

  const { dependencyFields } = meta;

  React.useEffect(() => {
    const formValues = getValues();
    if (!isEmpty(dependencyFields)) {
      let totalCount = 0;
      dependencyFields.map(fieldName => {
        totalCount += Number(formValues[fieldName]) || 0;
      });
      setVaule(totalCount);
    }
  }, [formState]);

  return fieldName ? <ReadOnlyText fieldName={fieldName} value={String(value)} {...meta} /> : <></>;
};

export default HookReadOnlyCumulativeNumber;
