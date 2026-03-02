import { Dictionary, IApiResponseFailure, IEntityData, IUserView } from "@cxpui/common";
import { IAllEntity, Person } from "@cxpui/commoncontrols";
import { ProductTaxonomyApi, getPeopleStartwithUPNOrName } from "@cxpui/generalapi";
import { ADOOperationType, CreateADOWorkItem, ICreateADOWorkItemPayload } from "@cxpui/service";
import {
  IDropdownOption,
  IPersonaSharedProps,
  IPickerItemProps,
  ITag,
  Icon,
  IconButton,
  PersonaInitialsColor,
  PersonaPresence,
  PersonaSize
} from "@fluentui/react";
import React from "react";
import { FieldError } from "react-hook-form";
import { IAzureServiceCategory } from "../../Models/IAzureService";
import { IHookPerson } from "../../Models/IHookPerson";
import { HookInlineFormConstants, UnassignedPerson } from "./Constants";
import { HookInlineFormStrings } from "./Strings";
import { IBlockStatusChange } from "../../Models/IBlockStatusChange";
import { IPhaseView } from "../../Models/Phase";
import CPJStrings from "../../Strings/CPJStrings";

/**
 * If error, add error class name to field class
 * @param className field class name
 * @param error is error
 * @returns Class name
 */
export const FieldClassName = (className: string, error?: FieldError): string => {
  return error ? `${className} error` : className;
};

/**
 * Get Product Taxonomies (API call)
 * @returns Service Categores
 */
export const GetProductTaxonomies = (): Promise<Dictionary<IAzureServiceCategory>> => {
  const productTaxonomyApi = new ProductTaxonomyApi();
  return productTaxonomyApi.getProductMod().then(insightProductTaxonomies => {
    const result: Dictionary<IAzureServiceCategory> = {};
    if (insightProductTaxonomies.isSuccess) {
      Object.values(insightProductTaxonomies.result.Results).forEach(category => {
        result[category.Document.Id] = {
          id: category.Document.Id,
          name: category.Document.Name,
          services: {}
        };
        Object.values(category.Document.Items).map(service => {
          result[category.Document.Id].services[service.Id] = {
            id: service.Id,
            name: service.Name
          };
        });
      });
    }
    return result;
  });
};

/**
 * Search Graph for People
 * @param filter filter text
 * @param peoplePickerApi people picker api
 * @param authContext auth context for getting "me"
 * @param includeUnassigned include unassigned (individual people picker)
 * @returns promise with results
 */
export const onResolveSuggestions = (
  filter: string,
  userDetails?: IUserView,
  includeUnassigned?: boolean
): PromiseLike<IHookPerson[]> => {
  return getPeopleStartwithUPNOrName(filter, 10).then(searchResults => {
    const results = includeUnassigned ? [UnassignedPerson] : [];
    if (userDetails) {
      results.push({
        BusinessPhones: userDetails.BusinessPhones,
        CxpIsRef: false,
        Department: userDetails.Department,
        EmailAddress: userDetails.EmailAddress,
        FirstName: userDetails.FirstName,
        LastName: userDetails.LastName,
        Title: userDetails.Title,
        Upn: userDetails.Upn
      });
    }
    return [
      ...results,
      ...searchResults.map(person => ({
        BusinessPhones: person.businessPhones,
        CxpIsRef: false,
        Department: person.department,
        EmailAddress: person.userPrincipalName,
        FirstName: person.displayName,
        LastName: person.givenName,
        Title: person.title,
        Upn: person.userPrincipalName
      }))
    ];
  });
};

/**
 * On Render Person
 * @param props Props
 * @param onRemovePerson Remove Person function
 * @returns Person
 */
export const onRenderPerson = (props: IPickerItemProps<IHookPerson>, onRemovePerson: (upn: string) => void) => {
  if (props?.item?.Upn === HookInlineFormConstants.unassigned) {
    const userPersona = {} as IPersonaSharedProps;
    userPersona.imageUrl = "";
    userPersona.showSecondaryText = false;
    userPersona.initialsColor = PersonaInitialsColor.darkRed;
    userPersona.text = HookInlineFormConstants.unassigned;

    return (
      <div className="selected-person" key={props.item.Upn} role="listitem">
        <Person
          {...userPersona}
          className="contact-persona"
          size={PersonaSize.size32}
          upn={""}
          disableCard={true}
          presence={PersonaPresence.none}
          hidePersonaDetails={false}
          data-is-focusable="false"
          data-is-sub-focuszone="false"
          data-selection-index="0"
        />

        <IconButton
          iconProps={{ iconName: "Cancel" }}
          data-is-focusable="true"
          data-is-sub-focuszone="true"
          data-selection-index="0"
          className="remove-button"
          onClick={() => onRemovePerson(props.item.Upn)}
          tabIndex={0}
          title={HookInlineFormStrings.clickToClear}
          aria-label={`${props.item.Upn} ${HookInlineFormStrings.clear}`}
        />
      </div>
    );
  } else {
    return (
      <div className="selected-person" key={props.item.Upn} role="listitem">
        <Person upn={props.item.Upn} showSecondaryText secondaryText={props.item.Upn} size={PersonaSize.size32} />
        <IconButton
          iconProps={{ iconName: "Cancel" }}
          data-is-focusable="true"
          data-is-sub-focuszone="true"
          data-selection-index="0"
          className="remove-button"
          onClick={() => onRemovePerson(props.item.Upn)}
          tabIndex={0}
          title={HookInlineFormStrings.clickToClear}
          aria-label={`${props.item.Upn} ${HookInlineFormStrings.clear}`}
        />
      </div>
    );
  }
};

/**
 * Render Suggestion Person
 * @param props Props
 * @returns Person JSX
 */
export const onRenderPersonSuggestion = (props: IHookPerson) => {
  if (props && props.Upn === HookInlineFormConstants.unassigned) {
    const userPersona = {} as IPersonaSharedProps;
    userPersona.imageUrl = "";
    userPersona.showSecondaryText = false;
    userPersona.initialsColor = PersonaInitialsColor.darkRed;
    userPersona.text = HookInlineFormConstants.unassigned;

    return (
      <div className="selected-person" key={props.Upn} role="listitem">
        <Person
          {...userPersona}
          className="contact-persona"
          size={PersonaSize.size32}
          upn={""}
          disableCard={true}
          presence={PersonaPresence.none}
          hidePersonaDetails={false}
          data-is-focusable="false"
          data-is-sub-focuszone="false"
          data-selection-index="0"
        />
      </div>
    );
  } else {
    return (
      <div className="suggested-person" key={props.Upn}>
        <Person
          showSecondaryText={props.text === HookInlineFormConstants.unassigned ? false : true}
          upn={props.Upn}
          secondaryText={props.Upn}
          size={PersonaSize.size32}
          disableCard={true}
        />
      </div>
    );
  }
};

/**
 * List contains tag list
 * @param tag Tag
 * @param tagList Tag List
 * @returns result
 */
export const ListContainsTagList = (tag: ITag, tagList?: ITag[]) => {
  if (!tagList || !tagList.length || tagList.length === 0) {
    return false;
  }
  return tagList.some(compareTag => compareTag.key === tag.key);
};

/**
 * Render Dropdown Item with Icon
 * @param option Option
 * @returns Item with Icon
 */
export const onRenderDropdownItemWithIcon = (option: IDropdownOption): JSX.Element => {
  return (
    <>
      {option && (
        <div className="dropdown-option">
          {option && option.data && option.data.iconName && option.data.iconTitle ? (
            <Icon
              className="dropdown-icon"
              iconName={option.data.iconName}
              aria-hidden
              title={option.data.iconTitle}
              style={option.data.iconColor ? { color: option.data.iconColor } : undefined}
            />
          ) : (
            <></>
          )}
          <span title={option.title ? option.title : option.text}>{option.text}</span>
        </div>
      )}
    </>
  );
};

/**
 * Removes upn and date from status reason description text
 * @param text Text
 * @returns Cleaned text
 */
export const CleanStatusReasonDescription = (text: string): string => {
  const withoutDate = text.slice(17);
  const byIndex = withoutDate.lastIndexOf(` ${HookInlineFormStrings.by} `);
  return withoutDate.slice(0, byIndex);
};

/**
 * Component Types that can be passed in to the HookPopOutEditor
 */
export enum SupportedPopOutEditors {
  RichText = "RichText",
  Textarea = "Textarea"
}

/**
 * Get Custom Save Function for Hook Inline Form
 * @param customSaveKey Custom Save Key
 * @returns Save Function
 */
export const CustomSaveFunctions: Dictionary<(data: IEntityData) => Promise<IEntityData>> = {
  AddFromADOWorkItem: (data: IEntityData) => {
    const payload: ICreateADOWorkItemPayload = {
      CeresEntityType: `${data.CeresEntityType}`,
      OperationType: ADOOperationType.Link,
      CeresLinkedEntity: data.CeresLinkedEntity ? `${data.CeresLinkedEntity}` : data.EntityId,
      CeresLinkedProjectId: data.EntityId,
      ADOEntityLink: `${data.ADOEntityLink}`
    };
    return CreateADOWorkItem(data.ProgramName, ADOOperationType.Link, payload)
      .then(response => {
        if (response.isSuccess) {
          return response.result as IEntityData;
        } else {
          throw (response as IApiResponseFailure).error?.message;
        }
      })
      .catch(error => {
        throw error;
      });
  }
};

/**
 * Get Parent Customer (recursive) from all entities (from provider)
 * @param allEntities All Entities
 * @param entity Entity
 * @returns Parent Customer
 */
export const GetParentCustomer = (allEntities: IAllEntity, entity: IEntityData): IEntityData => {
  const parentEntity = allEntities?.[entity?.EntityType]?.entities?.[entity?.EntityId]?.Parent;
  if (parentEntity) {
    return GetParentCustomer(allEntities, parentEntity);
  } else {
    return entity;
  }
};

export const GetFieldDataTestId = (
  fieldName: string,
  programName: string,
  entityType: string,
  entityId?: string
): string => {
  return `${programName}-${entityType}-${entityId}-${fieldName}`;
};

export const ProcessBlockStatusChange = (
  blockStatusChange: IBlockStatusChange,
  entity: IEntityData,
  option: IDropdownOption
): IDropdownOption => {
  let block: boolean = false;
  blockStatusChange.conditionKeys.forEach(conditionKey => {
    switch (conditionKey) {
      case "OpenTaskCount":
        if ((entity?.OpenTaskCount as number) > 0) {
          block = true;
        }
        break;
      case "OpenPhases":
        if (
          (entity?.Phases as IPhaseView[])?.some(
            phase =>
              phase.PhaseOutcomesStatus === CPJStrings.phases.statuses.started ||
              phase.PhaseOutcomesStatus === CPJStrings.phases.statuses.inProgress ||
              phase.PhaseOutcomesStatus === CPJStrings.phases.statuses.notStarted
          )
        ) {
          block = true;
        }
        break;
    }
  });

  return block
    ? {
        ...option,
        disabled: true,
        title: blockStatusChange.message,
        data: {
          iconName: "Info",
          iconTitle: blockStatusChange.message,
          iconColor: HookInlineFormConstants.errorColor
        }
      }
    : option;
};
