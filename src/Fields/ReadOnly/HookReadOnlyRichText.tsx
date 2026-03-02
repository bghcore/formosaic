import { IHookFieldSharedProps } from "../../Interfaces/IHookFieldSharedProps";

import { ElxHtml } from "@elixir/fx/lib/components/Html/ElxHtml";
import React from "react";

const HookReadOnlyRichText = (props: IHookFieldSharedProps<{}>) => {
  const { value } = props;

  return (
    <div className="hook-read-only-rich-text-editor">
      <ElxHtml content={value as string} />
    </div>
  );
};

export default HookReadOnlyRichText;
