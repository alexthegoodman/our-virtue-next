"use client";

import { useEffect, useRef, useState } from "react";
import { formatMention } from "@/lib/mentions";
import styles from "./MentionTextarea.module.css";

interface Suggestion {
  type: "user" | "subscriber";
  id: string;
  label: string;
}

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  className?: string;
  id?: string;
  required?: boolean;
}

// A plain <textarea> that shows an autocomplete menu of users/subscribers
// after typing "@", and inserts a @[label](mention:type:id) token when one
// is picked. MentionText renders that token back out as a styled mention.
export default function MentionTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  maxLength,
  className,
  id,
  required,
}: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const findMentionQuery = (text: string, cursor: number) => {
    const upToCursor = text.slice(0, cursor);
    const match = upToCursor.match(/(?:^|\s)@([a-zA-Z0-9._-]*)$/);
    if (!match) return null;
    const query = match[1];
    const start = cursor - query.length - 1; // index of "@"
    return { query, start };
  };

  const checkForMention = (text: string, cursor: number) => {
    const found = findMentionQuery(text, cursor);
    if (!found) {
      setShowMenu(false);
      setMentionStart(null);
      return;
    }

    setMentionStart(found.start);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("auth-token");
        const response = await fetch(
          `/api/mentions/search?q=${encodeURIComponent(found.query)}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (!response.ok) {
          setSuggestions([]);
          setShowMenu(false);
          return;
        }
        const data = await response.json();
        const results: Suggestion[] = data.results || [];
        setSuggestions(results);
        setShowMenu(results.length > 0);
        setActiveIndex(0);
      } catch {
        setSuggestions([]);
        setShowMenu(false);
      } finally {
        setLoading(false);
      }
    }, 150);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    checkForMention(newValue, e.target.selectionStart ?? newValue.length);
  };

  const handleCaretMove = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    checkForMention(target.value, target.selectionStart ?? target.value.length);
  };

  const selectSuggestion = (suggestion: Suggestion) => {
    const textarea = textareaRef.current;
    if (mentionStart === null || !textarea) return;

    const cursor = textarea.selectionStart ?? value.length;
    const before = value.slice(0, mentionStart);
    const after = value.slice(cursor);
    const insertion = `${formatMention(
      suggestion.type,
      suggestion.id,
      suggestion.label
    )} `;
    const newValue = before + insertion + after;

    onChange(newValue);
    setShowMenu(false);
    setSuggestions([]);
    setMentionStart(null);

    requestAnimationFrame(() => {
      textarea.focus();
      const pos = before.length + insertion.length;
      textarea.setSelectionRange(pos, pos);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMenu || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setShowMenu(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleCaretMove}
        onClick={handleCaretMove}
        onBlur={() => setShowMenu(false)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        required={required}
        className={className}
      />
      {showMenu && (
        <ul className={styles.menu}>
          {suggestions.map((s, i) => (
            <li
              key={`${s.type}:${s.id}`}
              className={i === activeIndex ? styles.activeItem : styles.item}
              onMouseDown={(e) => {
                e.preventDefault();
                selectSuggestion(s);
              }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <span className={styles.badge}>
                {s.type === "user" ? "@" : "✉"}
              </span>
              {s.label}
            </li>
          ))}
          {loading && <li className={styles.hint}>Searching…</li>}
        </ul>
      )}
    </div>
  );
}
