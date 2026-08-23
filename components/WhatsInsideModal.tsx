"use client";

import { useEffect, useRef } from "react";
import { categorySummaries } from "@/content/categorySummaries";
import styles from "./WhatsInsideModal.module.css";

export default function WhatsInsideModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalPoems = categorySummaries.reduce(
    (sum, cat) => sum + cat.poemCount,
    0
  );

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-inside-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.panelHeader}>
          <div>
            <span className={styles.kicker}>What&rsquo;s Inside</span>
            <h2 id="whats-inside-title" className={styles.title}>
              {totalPoems} Poems, {categorySummaries.length} Categories
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close"
          >
            Close
          </button>
        </div>

        <div className={styles.list}>
          {categorySummaries.map((category) => (
            <div key={category.key} className={styles.item}>
              <div className={styles.itemHeader}>
                <h3>{category.title}</h3>
                <span className={styles.count}>{category.poemCount}</span>
              </div>
              <p>{category.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
