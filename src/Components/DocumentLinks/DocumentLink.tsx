import { nameofFactory } from "@cxpui/common";
import { AnchorTag } from "@cxpui/commoncontrols";
import { IconButton, TextField, TooltipHost } from "@fluentui/react";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { IDocumentLink } from "../../../../Models/DocumentLink";
import { IHookDocumentLink } from "../../../../Models/IHookDocumentLink";
import CPJStrings from "../../../../Strings/CPJStrings";
import { HookInlineFormConstants } from "../../Constants";
import { GetFieldDataTestId } from "../../Helpers";
import { HookInlineFormStrings } from "../../Strings";

interface IDocumentLinkProps {
  fieldName: string;
  programName: string;
  entityType: string;
  entityId: string;
  readOnly?: boolean;
  index?: number;
  title?: string;
  url?: string;
  addNewLink?: boolean;
  saveLinks: (newLink: IDocumentLink, addNewLink?: boolean, index?: number) => void;
  onCancelAddLink?: () => void;
  onConfirmDeleteLink?: (index: number) => void;
}

// eslint-disable-next-line max-lines-per-function
const DocumentLink = (props: IDocumentLinkProps) => {
  const {
    fieldName,
    programName,
    entityType,
    entityId,
    readOnly,
    index,
    title,
    url,
    addNewLink,
    saveLinks,
    onCancelAddLink,
    onConfirmDeleteLink
  } = props;
  const { confirm, cancel, linkTitleLabel, linkUrlLabel, add, edit, deleteLabel } = HookInlineFormStrings;

  const [editingLink, setEditingLink] = React.useState<boolean>(false);

  const { control, handleSubmit, setValue, reset, trigger } = useForm({
    mode: "onChange",
    defaultValues: {
      title: addNewLink ? "" : title,
      url: addNewLink ? "" : url
    }
  });

  const nameOf = nameofFactory<IHookDocumentLink>();

  const onSubmit = (data: IHookDocumentLink) => {
    saveLinks({ EntityTitle: data.title, DocumentLink: data.url }, addNewLink, index);
    setEditingLink(false);
  };

  React.useEffect(() => {
    setEditingLink(addNewLink);
  }, [title, url, addNewLink]);

  const onLinkTitleChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
    setValue(nameOf("title"), newValue);
    trigger(nameOf("title"));
  };

  const onLinkUrlChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
    setValue(nameOf("url"), newValue);
    trigger(nameOf("url"));
  };

  const onEditDocumentLink = () => {
    setEditingLink(true);
  };

  const onCancelFormChanges = () => {
    reset();
    setEditingLink(false);
    if (onCancelAddLink) {
      onCancelAddLink();
    }
  };

  const onDelete = () => {
    onConfirmDeleteLink(index);
  };

  return editingLink ? (
    <div className="editing-link">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="header">
          <div className="header-label">
            {addNewLink ? add : edit} {CPJStrings.linkStrings.link}
          </div>
          <div className="edit-mode-action-buttons">
            <IconButton
              iconProps={{
                iconName: "CheckMark",
                className: "check-mark-icon",
                title: confirm
              }}
              ariaLabel={confirm}
              onClick={handleSubmit(onSubmit)}
            />
            <IconButton
              iconProps={{
                iconName: "Cancel",
                className: "cancel-icon",
                title: cancel
              }}
              ariaLabel={cancel}
              onClick={onCancelFormChanges}
            />
          </div>
        </div>

        <Controller
          name={nameOf("title")}
          control={control}
          rules={{
            required: {
              value: true,
              message: HookInlineFormStrings.required
            }
          }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              label={linkTitleLabel}
              onChange={onLinkTitleChange}
              value={field.value}
              required
              errorMessage={error ? error.message : undefined}
              data-testid={`${GetFieldDataTestId(fieldName, programName, entityType, entityId)}-link-title`}
            />
          )}
        />
        <Controller
          name={nameOf("url")}
          control={control}
          rules={{
            required: {
              value: true,
              message: HookInlineFormStrings.required
            },
            pattern: {
              value: HookInlineFormConstants.urlRegex,
              message: HookInlineFormStrings.urlRequired
            }
          }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              label={linkUrlLabel}
              onChange={onLinkUrlChange}
              value={field.value}
              required
              errorMessage={error ? error.message : undefined}
              data-testid={`${GetFieldDataTestId(fieldName, programName, entityType, entityId)}-link-url`}
            />
          )}
        />
      </form>
    </div>
  ) : addNewLink ? (
    <></>
  ) : (
    <div className="document-link-item">
      <AnchorTag customCss="link" url={url} text={title} />
      {!readOnly && (
        <div className="action-buttons">
          <TooltipHost content={edit}>
            <IconButton iconProps={{ iconName: "Edit" }} ariaLabel={edit} onClick={onEditDocumentLink} />
          </TooltipHost>
          <TooltipHost content={deleteLabel}>
            <IconButton
              iconProps={{ iconName: "Delete", className: "delete-icon" }}
              ariaLabel={deleteLabel}
              onClick={onDelete}
            />
          </TooltipHost>
        </div>
      )}
    </div>
  );
};

export default DocumentLink;
