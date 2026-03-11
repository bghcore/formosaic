import { IFieldProps, IFileUploadConfig, MAX_FILE_SIZE_MB_DEFAULT, getFileNames } from "@form-eng/core";
import React, { useRef } from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

const FileUpload = (props: IFieldProps<IFileUploadConfig>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, config, setFieldValue } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  const multiple = config?.multiple ?? false;
  const accept = config?.accept;
  const maxSizeMb = config?.maxSizeMb ?? MAX_FILE_SIZE_MB_DEFAULT;
  const maxSizeBytes = maxSizeMb * 1024 * 1024;

  const [sizeError, setSizeError] = React.useState<string | undefined>(undefined);

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={getFileNames(value)} />;
  }

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setFieldValue(fieldName, null);
      setSizeError(undefined);
      return;
    }
    const oversized = Array.from(files).find(f => f.size > maxSizeBytes);
    if (oversized) {
      setSizeError(`"${oversized.name}" exceeds the ${maxSizeMb} MB size limit.`);
      event.target.value = "";
      setFieldValue(fieldName, null);
      return;
    }
    setSizeError(undefined);
    setFieldValue(fieldName, multiple ? Array.from(files) : files[0]);
  };

  const fileNames = getFileNames(value);

  return (
    <div
      className="fe-file-upload"
      data-field-type="FileUpload"
      data-field-state={getFieldState({ error, required, readOnly })}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    >
      <input
        ref={inputRef}
        type="file"
        className="fe-file-upload__input"
        multiple={multiple}
        accept={accept}
        onChange={onChange}
        aria-invalid={!!error}
        aria-required={required}
        style={{ display: "none" }}
        aria-hidden="true"
      />
      <button
        type="button"
        className="fe-file-upload__button"
        onClick={() => inputRef.current?.click()}
      >
        {fileNames ? "Change file" : "Choose file"}
      </button>
      {fileNames && (
        <span className="fe-file-upload__filenames">{fileNames}</span>
      )}
      {sizeError && (
        <span className="fe-file-upload__size-error" role="alert">{sizeError}</span>
      )}
    </div>
  );
};

export default FileUpload;
