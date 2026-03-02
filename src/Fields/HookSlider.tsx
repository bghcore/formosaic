import { IHookFieldSharedProps } from "../Interfaces/IHookFieldSharedProps";

import { ISliderProps, Slider } from "@fluentui/react";
import React from "react";
import ReadOnlyText from "../Components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../Helpers";

interface IHookSliderProps extends ISliderProps {
  max?: number;
}

const HookSlider = (props: IHookFieldSharedProps<IHookSliderProps>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, meta, error, setFieldValue } = props;

  const [sliderValue, setSliderValue] = React.useState<number>(value as number);

  React.useEffect(() => {
    setSliderValue(value as number);
  }, [value]);

  const onChange = (value: number) => {
    setSliderValue(value);
  };

  const onChanged = (event: MouseEvent | TouchEvent | KeyboardEvent, value: number) => {
    setFieldValue(fieldName, value);
  };

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={String(value)} />
  ) : (
    <Slider
      className={FieldClassName("hook-slider", error)}
      value={sliderValue}
      onChanged={onChanged}
      onChange={onChange}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
      {...meta}
    />
  );
};

export default HookSlider;
