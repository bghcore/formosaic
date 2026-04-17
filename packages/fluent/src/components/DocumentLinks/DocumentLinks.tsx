import { Button, Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions, Tooltip } from "@fluentui/react-components";
import { AddRegular } from "@fluentui/react-icons";
import React from "react";
import { GetFieldDataTestId, DocumentLinksStrings } from "../../helpers";
import DocumentLink from "./DocumentLink";

export interface IDocumentLink {
  title: string;
  url: string;
}

interface IDocumentLinksProps extends React.HTMLAttributes<HTMLDivElement> {
  fieldName: string;
  testId?: string;
  className?: string;
  readOnly?: boolean;
  links: IDocumentLink[];
  onUpdateLinks?: (newLink: IDocumentLink, addNewLink?: boolean, index?: number) => void;
  onDeleteLink?: (index: number) => void;
}

const DocumentLinks = (props: IDocumentLinksProps) => {
  const { fieldName, testId, className, readOnly, links, onUpdateLinks, onDeleteLink, ...rest } = props;
  const [addNewLink, setAddNewLink] = React.useState<boolean>(false);
  const [deleteLinkIndex, setDeleteLinkIndex] = React.useState<number | undefined>(undefined);

  const onAddNewLink = () => setAddNewLink(true);
  const onCancelAddLink = () => setAddNewLink(false);
  const onConfirmDeleteLink = (index: number) => setDeleteLinkIndex(index);
  const onCloseDeleteDialog = () => setDeleteLinkIndex(undefined);
  const commitDeleteLink = () => { onDeleteLink(deleteLinkIndex); setDeleteLinkIndex(undefined); };
  const saveLinks = (newLink: IDocumentLink, addNew?: boolean, index?: number) => { onUpdateLinks(newLink, addNew, index); setAddNewLink(false); };

  return (
    <div {...rest} className={className}>
      {links?.length > 0 ? links.map((link, index) => (
        <DocumentLink
          key={`${link.url}-${index}`} fieldName={fieldName} testId={testId}
          index={index} title={link.title}
          url={link.url} saveLinks={saveLinks} onConfirmDeleteLink={onConfirmDeleteLink} readOnly={readOnly}
        />
      )) : null}
      {addNewLink ? (
        <DocumentLink fieldName={fieldName} testId={testId}
          addNewLink saveLinks={saveLinks} onCancelAddLink={onCancelAddLink} />
      ) : !readOnly ? (
        <div className="add-link">
          <Tooltip content={DocumentLinksStrings.addAnotherLink} relationship="label">
            <Button
              appearance="secondary"
              icon={<AddRegular />}
              onClick={onAddNewLink}
              data-testid={`${GetFieldDataTestId(fieldName, testId)}-add-link`}
            >
              {links?.length > 0 ? DocumentLinksStrings.addAnotherLink : DocumentLinksStrings.addLink}
            </Button>
          </Tooltip>
        </div>
      ) : null}

      <Dialog open={deleteLinkIndex !== undefined} onOpenChange={(_, data) => { if (!data.open) onCloseDeleteDialog(); }}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{DocumentLinksStrings.deleteLink}</DialogTitle>
            <DialogContent>
              {`${DocumentLinksStrings.confirmDeleteLink} ${links?.[deleteLinkIndex]?.title || ""}?`}
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={onCloseDeleteDialog}>{DocumentLinksStrings.cancel}</Button>
              <Button appearance="primary" onClick={commitDeleteLink}>{DocumentLinksStrings.delete}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default DocumentLinks;
