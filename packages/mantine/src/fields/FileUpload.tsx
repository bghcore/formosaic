import { IFieldProps, IFileUploadConfig, MAX_FILE_SIZE_MB_DEFAULT, getFileNames } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";
import { FileInput } from "@mantine/core";

const FileUpload = (props: IFieldProps<IFileUploadConfig>) => {
  const { fieldName, testId, value, readOnly, error, required, config, setFieldValue } = props;

  const multiple = config?.multiple ?? false;
  const accept = config?.accept;
  const maxSizeMb = config?.maxSizeMb ?? MAX_FILE_SIZE_MB_DEFAULT;
  const maxSizeBytes = maxSizeMb * 1024 * 1024;

  const [sizeError, setSizeError] = React.useState<string | undefined>(undefined);

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={getFileNames(value)} />;
  }

  const onChange = (files: File | File[] | null) => {
    if (!files || (Array.isArray(files) && files.length === 0)) {
      setFieldValue(fieldName, null);
      setSizeError(undefined);
      return;
    }
    const fileArray = Array.isArray(files) ? files : [files];
    const oversized = fileArray.find(f => f.size > maxSizeBytes);
    if (oversized) {
      setSizeError(`"${oversized.name}" exceeds the ${maxSizeMb} MB size limit.`);
      setFieldValue(fieldName, null);
      return;
    }
    setSizeError(undefined);
    setFieldValue(fieldName, multiple ? fileArray : fileArray[0]);
  };

  return (
    <div
      className="fe-file-upload"
      data-field-type="FileUpload"
      data-field-state={getFieldState({ error, required, readOnly })}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      <FileInput
        accept={accept}
        multiple={multiple}
        onChange={onChange}
        error={!!error}
        required={required}
        placeholder={getFileNames(value) || "Choose file"}
      />
      {sizeError && (
        <span className="fe-file-upload__size-error" role="alert">{sizeError}</span>
      )}
    </div>
  );
};

export default FileUpload;
