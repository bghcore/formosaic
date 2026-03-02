import { IHookFieldSharedProps, Person } from "@cxpui/commoncontrols";
import { IPersonaProps, PersonaSize } from "@fluentui/react";
import React from "react";

interface IHookReadOnlyPersonProps extends IPersonaProps {}

const HookReadOnlyPerson = (props: IHookFieldSharedProps<IHookReadOnlyPersonProps>) => {
  const { meta, value } = props;

  return (
    <>
      {value && (
        <Person
          upn={value as string}
          secondaryText={value as string}
          size={PersonaSize.size32}
          showSecondaryText
          {...meta}
        />
      )}
    </>
  );
};

export default HookReadOnlyPerson;
