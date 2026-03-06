import { FormConstants } from "@form-engine/core";
import React from "react";

interface IFormLoadingProps {
  loadingShimmerCount?: number;
  loadingFieldShimmerHeight?: number;
  inPanel?: boolean;
  hideTitleShimmer?: boolean;
}

export const FormLoading = (props: IFormLoadingProps) => {
  const { loadingShimmerCount, loadingFieldShimmerHeight, inPanel, hideTitleShimmer } = props;
  const count = loadingShimmerCount || FormConstants.loadingShimmerCount;
  const height = loadingFieldShimmerHeight || FormConstants.loadingFieldShimmerHeight;

  return (
    <div
      className={`df-form-loading ${inPanel ? "df-form-loading--panel" : ""}`}
      data-field-type="FormLoading"
      role="status"
      aria-label="Loading form"
    >
      {[...Array(count)].map((_, i) => (
        <div key={`df-loading-${i}`} className="df-form-loading__field">
          {!hideTitleShimmer && (
            <div className="df-skeleton df-skeleton--label" style={{ width: "33%" }} />
          )}
          <div className="df-skeleton df-skeleton--input" style={{ height: `${height}px` }} />
        </div>
      ))}
    </div>
  );
};

export default FormLoading;
