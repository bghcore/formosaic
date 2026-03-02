import { IHierarchicalOption } from "../../DropdownPanel/Components/OptionListWithSearch";
import { IDropdownItem } from "../../DropdownPanel/Interfaces/IDropdownItem";

/**
 * Sort Dropdown Options
 * @param a Service A
 * @param b Service B
 * @returns sort result
 */
export const SortDropdownOptions = (a: IHierarchicalOption | IDropdownItem, b: IHierarchicalOption | IDropdownItem) =>
  (a.text ? a.text.toLowerCase() : "") < (b.text ? b.text.toLowerCase() : "")
    ? -1
    : (a.text ? a.text.toLowerCase() : "") > (b.text ? b.text.toLowerCase() : "")
    ? 1
    : 0;
