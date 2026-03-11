import { IFieldProps } from "@form-eng/core";
import React, { useState, useMemo } from "react";
import { GetFieldDataTestId, getFieldState } from "../helpers";

const MultiSelectSearch = (props: IFieldProps<{}>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, options, setFieldValue } = props;
  const [searchTerm, setSearchTerm] = useState("");
  const selectedValues = (value as string[]) ?? [];
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options ?? [];
    const lower = searchTerm.toLowerCase();
    return (options ?? []).filter(o => o.label.toLowerCase().includes(lower));
  }, [options, searchTerm]);
  const onCheckChange = (optionValue: string, checked: boolean) => {
    const updated = checked ? [...selectedValues, optionValue] : selectedValues.filter(v => v !== optionValue);
    setFieldValue(fieldName, updated, false, 3000);
  };
  if (readOnly) {
    return selectedValues.length > 0 ? (
      <ul className="fe-multi-select-search-readonly" data-field-type="MultiSelectSearch" data-field-state="readonly">
        {selectedValues.map((v, i) => (<li key={i}>{v}</li>))}
      </ul>
    ) : (<span className="fe-read-only-text">-</span>);
  }
  return (
    <div className="fe-multi-select-search" data-field-type="MultiSelectSearch" data-field-state={getFieldState({ error, required, readOnly })} data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}>
      <input type="search" className="fe-multi-select-search__input" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} aria-label={`Search options for ${fieldName}`} />
      <fieldset className="fe-multi-select-search__options" aria-invalid={!!error} aria-required={required}>
        <legend className="fe-sr-only">Options</legend>
        {filteredOptions.map(option => {
          const optVal = String(option.value);
          const isChecked = selectedValues.includes(optVal);
          return (
            <label key={optVal} className="fe-multi-select-search__option">
              <input type="checkbox" checked={isChecked} disabled={option.disabled} onChange={e => onCheckChange(optVal, e.target.checked)} />
              <span>{option.label}</span>
            </label>
          );
        })}
      </fieldset>
    </div>
  );
};
export default MultiSelectSearch;
