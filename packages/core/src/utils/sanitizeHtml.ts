/**
 * Minimal HTML sanitizer — strips <script>, event handlers, javascript: URLs, and other
 * dangerous constructs. Consumers who need full DOMPurify behavior can pass a custom
 * `sanitize` prop to ReadOnlyRichText.
 *
 * Shared across all adapter packages via the `@formosaic/core/adapter-utils` subpath export.
 */
const UNSAFE_TAG_PAIR = /<(script|iframe|object|embed|style|noscript)[^>]*>[\s\S]*?<\/\1\s*>/gi;
const UNSAFE_TAG_SELF = /<(script|iframe|object|embed|link|style|meta|base)[^>]*\/?>(?!<\/\1)/gi;
const EVENT_HANDLERS = /\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_URLS = /(href|src|xlink:href|action|formaction)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]*)/gi;

export function sanitizeHtml(html: string): string {
  if (typeof html !== "string") return "";
  return html
    .replace(UNSAFE_TAG_PAIR, "")
    .replace(UNSAFE_TAG_SELF, "")
    .replace(EVENT_HANDLERS, "")
    .replace(JS_URLS, "");
}
