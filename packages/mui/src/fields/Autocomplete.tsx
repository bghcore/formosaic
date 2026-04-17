import { IFieldProps } from "@formosaic/core";
import { Autocomplete as MuiAutocomplete, TextField } from "@mui/material";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface IAutocompleteOption {
  value: string;
  label: string;
}

interface IAutocompleteConfig {
  placeHolder?: string;
}

const Autocomplete = (props: IFieldProps<IAutocompleteConfig>) => {
  const {
    fieldName, testId, value, readOnly, error, required, placeholder, options, setFieldValue, config,
    errorCount, saving, savePending, optionsLoading, label, type, description, helpText,
    ...rest
  } = props;

  const muiOptions: IAutocompleteOption[] = (options ?? []).map(o => ({
    value: String(o.value),
    label: o.label,
  }));

  const selected = muiOptions.find(o => o.value === String(value)) ?? null;

  const onChange = (_: React.SyntheticEvent, newValue: IAutocompleteOption | null) => {
    setFieldValue(fieldName, newValue?.value ?? "");
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={selected?.label ?? (value as string) ?? ""} />;
  }

  return (
    <MuiAutocomplete
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      className={FieldClassName("fe-autocomplete", error)}
      options={muiOptions}
      value={selected}
      onChange={onChange}
      getOptionLabel={option => option.label}
      isOptionEqualToValue={(opt, val) => opt.value === val.value}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          placeholder={placeholder ?? config?.placeHolder}
          error={!!error}
          required={required}
          inputProps={{
            ...params.inputProps,
            "aria-invalid": !!error,
            "data-testid": GetFieldDataTestId(fieldName, testId),
          }}
        />
      )}
    />
  );
};

export default Autocomplete;
