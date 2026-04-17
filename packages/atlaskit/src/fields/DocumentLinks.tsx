import { IFieldProps } from "@formosaic/core";
import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { GetFieldDataTestId, getFieldState, DocumentLinksStrings } from "../helpers";

export interface IDocumentLink {
  url: string;
  title?: string;
}

const DocumentLinks = (props: IFieldProps<{}>) => {
  const {
    fieldName, testId, value, readOnly, error, required, setFieldValue,
    errorCount, saving, savePending, options, optionsLoading, label, type, description, helpText, placeholder, config,
    ...rest
  } = props;

  const { watch } = useFormContext();
  const documentLinks: IDocumentLink[] = watch(`${fieldName}` as const) ?? [];
  const [newUrl, setNewUrl] = useState("");
  const [newText, setNewText] = useState("");

  const onAddLink = () => {
    if (!newUrl) return;
    const link: IDocumentLink = { url: newUrl, title: newText || newUrl };
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
        className="ak-document-links ak-document-links--readonly"
        data-field-type="DocumentLinks"
        data-field-state="readonly"
      >
        {(value as IDocumentLink[])?.map((link, i) => (
          <li key={i} className="ak-document-links__item">
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.title || link.url}
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      className="ak-document-links"
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      data-field-type="DocumentLinks"
      data-field-state={getFieldState({ error, required, readOnly })}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      <ul className="ak-document-links__list">
        {documentLinks.map((link, i) => (
          <li key={i} className="ak-document-links__item">
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.title || link.url}
            </a>
            <button
              type="button"
              className="ak-document-links__delete"
              onClick={() => onDeleteLink(i)}
              aria-label={`${DocumentLinksStrings.deleteLink}: ${link.title || link.url}`}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
      <div className="ak-document-links__add">
        <input
          type="url"
          className="ak-document-links__url-input"
          placeholder="URL"
          value={newUrl}
          onChange={e => setNewUrl(e.target.value)}
          aria-label={DocumentLinksStrings.link}
        />
        <input
          type="text"
          className="ak-document-links__text-input"
          placeholder="Label (optional)"
          value={newText}
          onChange={e => setNewText(e.target.value)}
          aria-label="Link label"
        />
        <button
          type="button"
          className="ak-btn ak-btn--secondary"
          onClick={onAddLink}
          disabled={!newUrl}
        >
          {documentLinks.length > 0 ? DocumentLinksStrings.addAnotherLink : DocumentLinksStrings.addLink}
        </button>
      </div>
    </div>
  );
};

export default DocumentLinks;
