import { IFieldProps, IFileUploadConfig, MAX_FILE_SIZE_MB_DEFAULT, getFileNames } from "@formosaic/core";
import React, { useRef } from "react";
import { Button } from "@fluentui/react-components";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const FileUpload = (props: IFieldProps<IFileUploadConfig>) => {
  const { fieldName, testId, value, readOnly, error, required, config, setFieldValue } = props;
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
      className={FieldClassName("fe-file-upload", error)}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      <input
        ref={inputRef}
        type="file"
        className="fe-file-upload__input"
        multiple={multiple}
        accept={accept}
        onChange={onChange}
        style={{ display: "none" }}
        aria-hidden="true"
      />
      <Button
        type="button"
        appearance="secondary"
        onClick={() => inputRef.current?.click()}
        className="fe-file-upload__button"
      >
        {fileNames ? "Change file" : "Choose file"}
      </Button>
      {fileNames && (
        <span className="fe-file-upload__filenames" style={{ marginLeft: "8px" }}>
          {fileNames}
        </span>
      )}
      {sizeError && (
        <span className="fe-file-upload__size-error" role="alert" style={{ color: "#a4262c", display: "block", marginTop: "4px" }}>
          {sizeError}
        </span>
      )}
    </div>
  );
};

export default FileUpload;
