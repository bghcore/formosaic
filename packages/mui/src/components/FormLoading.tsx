import { FormConstants } from "@form-eng/core";
import { Skeleton } from "@mui/material";
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
        <div key={`fe-loading-${i}`} className="form-field-loading" style={{ marginBottom: "16px" }}>
          {!hideTitleShimmer && <Skeleton variant="text" width="33%" />}
          <Skeleton
            variant="rectangular"
            height={loadingFieldShimmerHeight || FormConstants.loadingFieldShimmerHeight}
          />
        </div>
      ))}
    </div>
  );
};

export default FormLoading;
