import { FormConstants } from "@form-eng/core";
import { Skeleton, SkeletonItem } from "@fluentui/react-components";
import React from "react";

interface IFormLoadingProps {
  loadingShimmerCount?: number;
  loadingFieldShimmerHeight?: number;
  inPanel?: boolean;
  hideTitleShimmer?: boolean;
}

export const FormLoading = (props: IFormLoadingProps) => {
  const { loadingShimmerCount, loadingFieldShimmerHeight, inPanel, hideTitleShimmer } = props;
  return (
    <div className={`fe-loading ${inPanel ? "in-panel" : ""}`}>
      {[...Array(loadingShimmerCount || FormConstants.loadingShimmerCount)].map((_, i) => (
        <div key={`fe-loading-${i}`} className="form-field-loading">
          <Skeleton>
            {!hideTitleShimmer && <SkeletonItem style={{ width: "33%" }} />}
            <SkeletonItem style={{ height: `${loadingFieldShimmerHeight || FormConstants.loadingFieldShimmerHeight}px` }} />
          </Skeleton>
        </div>
      ))}
    </div>
  );
};

export default FormLoading;
