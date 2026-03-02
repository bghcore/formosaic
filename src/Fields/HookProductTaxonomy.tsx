import { IHookFieldSharedProps } from "../Interfaces/IHookFieldSharedProps";

import { IDropdownOption, IDropdownProps } from "@fluentui/react";
import React from "react";
import ProductTaxonomy from "../Components/ProductTaxonomy";
import { FieldClassName } from "../Helpers";

interface IHookProductTaxonomyProps extends IDropdownProps {}

const HookProductTaxonomy = (props: IHookFieldSharedProps<IHookProductTaxonomyProps>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, meta, error, setFieldValue } = props;

  const onSelectionChanged = (selectedItems: IDropdownOption[]) => {
    const serviceIds = selectedItems.map(item => item.key);
    setFieldValue(fieldName, serviceIds, false, 3000);
  };

  return readOnly ? (
    <ProductTaxonomy
      fieldName={fieldName}
      programName={programName}
      entityType={entityType}
      entityId={entityId}
      className="hook-read-only-product-taxonomy"
      selectedProductIds={value as string[]}
      readOnly
      meta={meta}
    />
  ) : (
    <ProductTaxonomy
      fieldName={fieldName}
      programName={programName}
      entityType={entityType}
      entityId={entityId}
      className={FieldClassName("hook-product-taxonomy", error)}
      selectedProductIds={value as string[]}
      onSelectionChanged={onSelectionChanged}
      meta={meta}
    />
  );
};

export default HookProductTaxonomy;
