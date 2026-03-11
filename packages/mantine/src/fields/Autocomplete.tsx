import { IFieldProps } from "@form-eng/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";
import { Autocomplete as MantineAutocomplete } from "@mantine/core";

const Autocomplete = (props: IFieldProps<{}>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, placeholder, options, setFieldValue } = props;

  const selectedLabel = options?.find(o => String(o.value) === String(value))?.label ?? (value as string) ?? "";

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={selectedLabel} />;
  }

  const data = options?.map(o => ({ value: String(o.value), label: o.label })) ?? [];

  return (
    <MantineAutocomplete
      className="fe-autocomplete"
      data={data}
      defaultValue={selectedLabel}
      onChange={(val) => {
        const match = options?.find(o => o.label === val);
        setFieldValue(fieldName, match ? String(match.value) : val);
      }}
      placeholder={placeholder}
      error={!!error}
      required={required}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    />
  );
};

export default Autocomplete;
