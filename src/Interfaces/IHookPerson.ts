import { IPersonaProps } from "@fluentui/react";

export interface IHookPerson extends IPersonaProps {
  BusinessPhones?: string[];
  CxpIsRef?: boolean;
  Department?: string;
  EmailAddress?: string;
  FirstName?: string;
  LastName?: string;
  Title?: string;
  Upn?: string;
}
