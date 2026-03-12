import { IEntityData } from "../utils";

export interface IFormosaicProps {
  configName: string;
  /** Optional test ID prefix for data-testid attributes */
  testId?: string;
  areAllFieldsReadonly?: boolean;
  expandCutoffCount?: number;
  collapsedMaxHeight?: number;
  isCreate?: boolean;
  enableFilter?: boolean;
  /** Current user's identifier for value functions like setLoggedInUser */
  currentUserId?: string;
  /** Callback when save error occurs */
  onSaveError?: (error: string) => void;
  /** Parent entity data for $parent expressions */
  parentEntity?: IEntityData;
}
