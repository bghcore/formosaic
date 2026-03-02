import { Dictionary, isEmpty } from "@cxpui/common";
import { IHierarchicalOption, OptionListWithSearch, SortDropdownOptions } from "@cxpui/commoncontrols";
import {
  DefaultButton,
  Dropdown,
  DropdownMenuItemType,
  IDropdownOption,
  IDropdownProps,
  Panel,
  PanelType
} from "@fluentui/react";
import React from "react";
import { IAzureServiceCategory } from "../../../Models/IAzureService";
import { GetFieldDataTestId, GetProductTaxonomies } from "../Helpers";
import { HookInlineFormStrings } from "../Strings";
import ReadOnlyText from "./ReadOnlyText";

interface IProductTaxonomyProps {
  className: string;
  fieldName: string;
  programName: string;
  entityType: string;
  entityId: string;
  selectedProductIds: string[];
  readOnly?: boolean;
  meta?: IDropdownProps;
  onSelectionChanged?: (selectedItems: IDropdownOption[]) => void;
}

// eslint-disable-next-line max-lines-per-function
const ProductTaxonomy = (props: IProductTaxonomyProps) => {
  const {
    fieldName,
    programName,
    entityType,
    entityId,
    className,
    selectedProductIds,
    readOnly,
    meta,
    onSelectionChanged
  } = props;
  const { unknown, noServicesSelected, edit, add, close, editServicesLabel, addServicesLabel } = HookInlineFormStrings;

  const [servicesDictionary, setServicesDictionary] = React.useState<Dictionary<IAzureServiceCategory>>({});
  const [services, setServices] = React.useState<IHierarchicalOption[]>();

  const [dropdownSelectedOptions, setDropdownSelectedOptions] = React.useState<IDropdownOption[]>([]);
  const [panelSelectedOptions, setPanelSelectedOptions] = React.useState<IDropdownOption[]>([]);

  const [editServices, setEditServices] = React.useState<boolean>(false);

  React.useEffect(() => {
    GetProductTaxonomies().then(services => {
      setServicesDictionary(services);
    });
  }, []);

  React.useEffect(() => {
    if (selectedProductIds && servicesDictionary) {
      const selectedServiceCategories: Dictionary<string[]> = {};
      selectedProductIds.forEach(service => {
        const splitIds = service.split(":");
        if (!selectedServiceCategories[splitIds[0]]) {
          selectedServiceCategories[splitIds[0]] = [splitIds[1]];
        } else {
          selectedServiceCategories[splitIds[0]].push(splitIds[1]);
        }
      });

      const headers = Object.keys(selectedServiceCategories)
        .map(serviceCategoryId => {
          return {
            key: serviceCategoryId,
            text: servicesDictionary[serviceCategoryId] ? servicesDictionary[serviceCategoryId].name : unknown,
            itemType: DropdownMenuItemType.Header
          };
        })
        .sort(SortDropdownOptions);

      let optionsWithHeaders: IDropdownOption[] = [];
      let options: IDropdownOption[] = [];

      headers.forEach(header => {
        const serviceCategoryId = header.key;
        const categoryServices: IDropdownOption[] = [];
        selectedServiceCategories[serviceCategoryId].forEach(serviceId => {
          categoryServices.push({
            key: `${serviceCategoryId}:${serviceId}`,
            text:
              servicesDictionary[serviceCategoryId] &&
              servicesDictionary[serviceCategoryId].services &&
              servicesDictionary[serviceCategoryId].services[serviceId]
                ? servicesDictionary[serviceCategoryId].services[serviceId].name
                : unknown
          });
        });

        categoryServices.sort(SortDropdownOptions);
        optionsWithHeaders = optionsWithHeaders.concat([header, ...categoryServices]);
        options = options.concat(categoryServices);
      });

      setDropdownSelectedOptions(optionsWithHeaders);
      setPanelSelectedOptions(options);
    }
  }, [selectedProductIds, servicesDictionary]);

  React.useEffect(() => {
    const items: IHierarchicalOption[] = Object.keys(servicesDictionary)
      .map(serviceCategoryId => {
        return {
          key: serviceCategoryId,
          text: servicesDictionary[serviceCategoryId].name,
          options: Object.keys(servicesDictionary[serviceCategoryId].services)
            .map(serviceId => {
              return {
                key: serviceId,
                text: servicesDictionary[serviceCategoryId].services[serviceId].name
              };
            })
            .sort(SortDropdownOptions)
        };
      })
      .sort(SortDropdownOptions);

    setServices(items);
  }, [servicesDictionary]);

  const onRenderTitle = (): JSX.Element => {
    return selectedProductIds ? <div>{selectedProductIds.length} services selected</div> : <></>;
  };

  const onEditServices = () => {
    setEditServices(true);
  };

  const onDismissPanel = () => {
    setEditServices(false);
  };

  return (
    <>
      {services && (
        <>
          <div className={className}>
            {dropdownSelectedOptions && dropdownSelectedOptions.length > 0 ? (
              <Dropdown
                options={dropdownSelectedOptions}
                selectedKey={!isEmpty(dropdownSelectedOptions) ? dropdownSelectedOptions[0].key : undefined}
                onRenderTitle={onRenderTitle}
                onChange={!readOnly ? onEditServices : undefined}
                {...meta}
              />
            ) : (
              <ReadOnlyText fieldName={fieldName} value={noServicesSelected} />
            )}

            {!readOnly && (
              <div className="edit-services">
                <DefaultButton
                  aria-label={
                    selectedProductIds && selectedProductIds.length > 0 ? editServicesLabel : addServicesLabel
                  }
                  text={selectedProductIds && selectedProductIds.length > 0 ? editServicesLabel : addServicesLabel}
                  iconProps={{ iconName: selectedProductIds && selectedProductIds.length > 0 ? edit : add }}
                  onClick={onEditServices}
                  data-testid={`${GetFieldDataTestId(fieldName, programName, entityType, entityId)}-open-panel`}
                />
              </div>
            )}
          </div>

          {!readOnly && (
            <Panel
              headerText="Product + Experiences"
              className="edit-services-panel"
              isOpen={editServices}
              onDismiss={onDismissPanel}
              type={PanelType.medium}
              isLightDismiss={true}
              closeButtonAriaLabel={close}>
              <OptionListWithSearch
                isOpen={editServices}
                options={services}
                selectedItems={panelSelectedOptions}
                onSelectionChanged={onSelectionChanged}
              />
            </Panel>
          )}
        </>
      )}
    </>
  );
};

export default ProductTaxonomy;
