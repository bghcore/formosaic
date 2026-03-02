import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import HookInlineFormWrapper, { IHookInlineFormWrapperProps } from "./HookInlineFormWrapper";
import { Log } from "@cxpui/common";
import { HookInlineFormStrings } from "../Strings";

export const HookFormBoundary = (props: IHookInlineFormWrapperProps) => {
  const { entityId, entityType, programName } = props;

  const {
    errorBoundary: { title, please, icm, andInclude }
  } = HookInlineFormStrings;

  const onError = (error: Error, info: { componentStack: string }) => {
    // eslint-disable-next-line no-console
    console.error({ error, info });
    Log(
      error,
      `HookFormBoundary - ${{ entityId, entityType, programName }}`,
      `${error.message} ${info?.componentStack}`
    );
  };

  const fallbackRender = ({ error }: { error: { message?: string; stack?: string } }) => (
    <div role="alert" className="hook-form-crashed">
      <h3>{title}</h3>
      <p className="open-icm">
        {please}
        <a
          className="icm-link"
          target="_blank"
          href="https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=b3J3m2"
        >
          {icm}
        </a>
        {andInclude}
      </p>
      <p className="entity-details">{`[${programName}] ${entityType} - ${entityId}`}</p>
      <pre style={{ color: "red" }}>{error.message}</pre>
      <textarea className="error-stack" rows={6} value={error.stack} />
    </div>
  );

  return (
    <ErrorBoundary fallbackRender={fallbackRender} onError={onError}>
      <HookInlineFormWrapper {...props} />
    </ErrorBoundary>
  );
};
