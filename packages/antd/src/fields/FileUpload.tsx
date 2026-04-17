import { IFieldProps, IFileUploadConfig, MAX_FILE_SIZE_MB_DEFAULT, getFileNames } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";
import { Upload, Button } from "antd";

const FileUpload = (props: IFieldProps<IFileUploadConfig>) => {
  const {
    fieldName, testId, value, readOnly, error, required, config, setFieldValue,
    errorCount, saving, savePending, options, optionsLoading, label, type, description, helpText, placeholder,
    ...rest
  } = props;

  const multiple = config?.multiple ?? false;
  const accept = config?.accept;
  const maxSizeMb = config?.maxSizeMb ?? MAX_FILE_SIZE_MB_DEFAULT;
  const maxSizeBytes = maxSizeMb * 1024 * 1024;

  const [sizeError, setSizeError] = React.useState<string | undefined>(undefined);

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={getFileNames(value)} />;
  }

  const beforeUpload = (file: File) => {
    if (file.size > maxSizeBytes) {
      setSizeError(`"${file.name}" exceeds the ${maxSizeMb} MB size limit.`);
      return Upload.LIST_IGNORE;
    }
    setSizeError(undefined);
    setFieldValue(fieldName, multiple ? (value ? [...(Array.isArray(value) ? value : [value]), file] : [file]) : file);
    return false; // Prevent auto-upload
  };

  return (
    <div
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      className="fe-file-upload"
      data-field-type="FileUpload"
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      <Upload
        beforeUpload={beforeUpload}
        multiple={multiple}
        accept={accept}
        showUploadList={false}
      >
        <Button>{getFileNames(value) ? "Change file" : "Choose file"}</Button>
      </Upload>
      {getFileNames(value) && (
        <span className="fe-file-upload__filenames">{getFileNames(value)}</span>
      )}
      {sizeError && (
        <span className="fe-file-upload__size-error" role="alert">{sizeError}</span>
      )}
    </div>
  );
};

export default FileUpload;
