import { parseContentSegments } from "@/lib/mentions";
import styles from "./MentionText.module.css";

interface MentionTextProps {
  content: string;
}

// Renders free-text content, styling any @[label](mention:type:id) tokens
// as highlighted mention chips instead of raw markup.
export default function MentionText({ content }: MentionTextProps) {
  const segments = parseContentSegments(content);

  return (
    <>
      {segments.map((segment, index) =>
        segment.type === "mention" ? (
          <span key={index} className={styles.mention}>
            {segment.value}
          </span>
        ) : (
          <span key={index}>{segment.value}</span>
        )
      )}
    </>
  );
}
