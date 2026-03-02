import { ElxDialog } from "@elixir/components";
import { DefaultButton, TooltipHost } from "@fluentui/react";
import React from "react";
import { IDocumentLink } from "../../../../Models/DocumentLink";
import CPJStrings from "../../../../Strings/CPJStrings";
import DocumentLink from "./DocumentLink";
import { GetFieldDataTestId } from "../../Helpers";

interface IDocumentLinksProps {
  fieldName: string;
  programName: string;
  entityType: string;
  entityId: string;
  className?: string;
  readOnly?: boolean;
  links: IDocumentLink[];
  onUpdateLinks?: (newLink: IDocumentLink, addNewLink?: boolean, index?: number) => void;
  onDeleteLink?: (index: number) => void;
}

const DocumentLinks = (props: IDocumentLinksProps) => {
  const {
    fieldName,
    programName,
    entityType,
    entityId,
    className,
    readOnly,
    links,
    onUpdateLinks,
    onDeleteLink
  } = props;

  const [addNewLink, setAddNewLink] = React.useState<boolean>(false);
  const [deleteLinkIndex, setDeleteLinkIndex] = React.useState<number | undefined>(undefined);

  const onAddNewLink = () => {
    setAddNewLink(true);
  };

  const onCancelAddLink = () => {
    setAddNewLink(false);
  };

  const onConfirmDeleteLink = (index: number) => {
    setDeleteLinkIndex(index);
  };

  const onCloseDeleteDialog = () => {
    setDeleteLinkIndex(undefined);
  };

  const commitDeleteLink = () => {
    onDeleteLink(deleteLinkIndex);
    setDeleteLinkIndex(undefined);
  };

  const saveLinks = (newLink: IDocumentLink, addNewLink?: boolean, index?: number) => {
    onUpdateLinks(newLink, addNewLink, index);
    setAddNewLink(false);
  };

  return (
    <div className={className}>
      {links && links.length > 0 ? (
        links.map((link, index) => {
          return (
            <DocumentLink
              key={`${link.DocumentLink}-${index}`}
              fieldName={fieldName}
              programName={programName}
              entityType={entityType}
              entityId={entityId}
              index={index}
              title={link.EntityTitle}
              url={link.DocumentLink}
              saveLinks={saveLinks}
              onConfirmDeleteLink={onConfirmDeleteLink}
              readOnly={readOnly}
            />
          );
        })
      ) : (
        <></>
      )}
      {addNewLink ? (
        <DocumentLink
          fieldName={fieldName}
          programName={programName}
          entityType={entityType}
          entityId={entityId}
          addNewLink
          saveLinks={saveLinks}
          onCancelAddLink={onCancelAddLink}
        />
      ) : !readOnly ? (
        <div className="add-link">
          <TooltipHost id={CPJStrings.linkStrings.addAnotherLink} content={CPJStrings.linkStrings.addAnotherLink}>
            <DefaultButton
              aria-label={CPJStrings.linkStrings.addAnotherLink}
              text={links && links.length > 0 ? CPJStrings.linkStrings.addAnotherLink : CPJStrings.linkStrings.addLink}
              iconProps={{ iconName: "Add" }}
              onClick={onAddNewLink}
              data-testid={`${GetFieldDataTestId(fieldName, programName, entityType, entityId)}-add-link`}
            />
          </TooltipHost>
        </div>
      ) : (
        <></>
      )}
      <ElxDialog
        hidden={deleteLinkIndex === undefined}
        dismissable
        dialogContentProps={{ title: CPJStrings.linkStrings.deleteLink, type: 2 }}
        primaryButtonProps={{ text: CPJStrings.buttons.deleteStr, onClick: commitDeleteLink }}
        cancelButtonProps={{ text: CPJStrings.buttons.cancel, onClick: onCloseDeleteDialog }}
        onDismiss={onCloseDeleteDialog}>
        <div>{`${CPJStrings.linkStrings.confirmDeleteLink} ${
          links && links[deleteLinkIndex] ? links[deleteLinkIndex].EntityTitle : ""
        }?`}</div>
      </ElxDialog>
    </div>
  );
};

export default DocumentLinks;
