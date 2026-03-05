import { IFieldProps } from "@bghcore/dynamic-forms-core";
import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { GetFieldDataTestId, getFieldState, DocumentLinksStrings } from "../helpers";

export interface IDocumentLink {
  url: string;
  text?: string;
}

const HookDocumentLinks = (props: IFieldProps<{}>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, setFieldValue } = props;

  const { watch } = useFormContext();
  const documentLinks: IDocumentLink[] = watch(`${fieldName}` as const) ?? [];
  const [newUrl, setNewUrl] = useState("");
  const [newText, setNewText] = useState("");

  const onAddLink = () => {
    if (!newUrl) return;
    const link: IDocumentLink = { url: newUrl, text: newText || newUrl };
    setFieldValue(fieldName, [...documentLinks, link]);
    setNewUrl("");
    setNewText("");
  };

  const onDeleteLink = (index: number) => {
    const updated = [...documentLinks];
    updated.splice(index, 1);
    setFieldValue(fieldName, updated);
  };

  if (readOnly) {
    return (
      <ul
        className="df-document-links df-document-links--readonly"
        data-field-type="DocumentLinks"
        data-field-state="readonly"
      >
        {(value as IDocumentLink[])?.map((link, i) => (
          <li key={i} className="df-document-links__item">
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.text || link.url}
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      className="df-document-links"
      data-field-type="DocumentLinks"
      data-field-state={getFieldState({ error, required, readOnly })}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    >
      <ul className="df-document-links__list">
        {documentLinks.map((link, i) => (
          <li key={i} className="df-document-links__item">
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.text || link.url}
            </a>
            <button
              type="button"
              className="df-document-links__delete"
              onClick={() => onDeleteLink(i)}
              aria-label={`${DocumentLinksStrings.deleteLink}: ${link.text || link.url}`}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
      <div className="df-document-links__add">
        <input
          type="url"
          className="df-document-links__url-input"
          placeholder="URL"
          value={newUrl}
          onChange={e => setNewUrl(e.target.value)}
          aria-label={DocumentLinksStrings.link}
        />
        <input
          type="text"
          className="df-document-links__text-input"
          placeholder="Label (optional)"
          value={newText}
          onChange={e => setNewText(e.target.value)}
          aria-label="Link label"
        />
        <button
          type="button"
          className="df-btn df-btn--secondary"
          onClick={onAddLink}
          disabled={!newUrl}
        >
          {documentLinks.length > 0 ? DocumentLinksStrings.addAnotherLink : DocumentLinksStrings.addLink}
        </button>
      </div>
    </div>
  );
};

export default HookDocumentLinks;
