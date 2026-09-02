// Mentions are stored inline in comment/post/thread content using a simple
// markdown-link-style token: @[label](mention:type:id). This avoids a
// separate schema migration — content fields are already free-text strings —
// while still letting us resolve a mention back to a real User or
// EmailSubscriber for rendering and for email notifications.

export type MentionType = "user" | "subscriber";

export interface ParsedMention {
  type: MentionType;
  id: string;
  label: string;
}

const MENTION_PATTERN =
  /@\[([^\]]+)\]\(mention:(user|subscriber):([a-zA-Z0-9]+)\)/g;

export function formatMention(
  type: MentionType,
  id: string,
  label: string
): string {
  return `@[${label}](mention:${type}:${id})`;
}

// Resolves every distinct mentioned user/subscriber referenced in content.
export function extractMentions(content: string): ParsedMention[] {
  const mentions: ParsedMention[] = [];
  const seen = new Set<string>();
  const pattern = new RegExp(MENTION_PATTERN);
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    const [, label, type, id] = match;
    const key = `${type}:${id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    mentions.push({ type: type as MentionType, id, label });
  }

  return mentions;
}

export interface ContentSegment {
  type: "text" | "mention";
  value: string;
  mention?: ParsedMention;
}

// Splits content into plain-text and mention segments so the UI can render
// mentions with their own styling.
export function parseContentSegments(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  const pattern = new RegExp(MENTION_PATTERN);
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: content.slice(lastIndex, match.index) });
    }
    const [, label, type, id] = match;
    segments.push({
      type: "mention",
      value: `@${label}`,
      mention: { type: type as MentionType, id, label },
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({ type: "text", value: content.slice(lastIndex) });
  }

  return segments;
}

// Renders content as plain text (for email previews, notifications, etc).
export function toPlainText(content: string): string {
  const pattern = new RegExp(MENTION_PATTERN);
  return content.replace(pattern, (_match, label) => `@${label}`);
}
