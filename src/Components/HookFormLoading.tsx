import { Shimmer, ShimmerElementType } from "@fluentui/react";
import React from "react";
import { HookInlineFormConstants } from "../Constants";

interface IHookFormLoadingProps {
  loadingShimmerCount?: number;
  loadingFieldShimmerHeight?: number;
  inPanel?: boolean;
  hideTitleShimmer?: boolean;
}

export const HookFormLoading = (props: IHookFormLoadingProps) => {
  const { loadingShimmerCount, loadingFieldShimmerHeight, inPanel, hideTitleShimmer } = props;

  return (
    <div className={`hook-form-loading ${inPanel ? "in-panel" : ""}`}>
      {[...Array(loadingShimmerCount ? loadingShimmerCount : HookInlineFormConstants.loadingShimmerCount)].map(
        (e, i) => (
          <div key={`hook-form-loading-${i}`} className="form-field-loading">
            {!hideTitleShimmer && <Shimmer width="33%" />}
            <Shimmer
              shimmerElements={[
                {
                  type: ShimmerElementType.line,
                  width: "100%",
                  height: loadingFieldShimmerHeight
                    ? loadingFieldShimmerHeight
                    : HookInlineFormConstants.loadingFieldShimmerHeight
                }
              ]}
            />
          </div>
        )
      )}
    </div>
  );
};

export default HookFormLoading;
