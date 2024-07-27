"use client";

import { poemList } from "@/content/poems";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import styles from "./PrimaryLayout.module.css";

export default function PrimaryLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [currentChapter, setCurrentChapter] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    if (window) {
      setCurrentChapter(window.location.pathname.split("/")[1]);
    }
  }, []);

  const currentPoems = poemList.find(
    (chapter) => chapter.key === currentChapter
  )?.items;

  const handleChapterClick = (key: string) => {
    setCurrentChapter(key);
  };

  const handlePoemClick = (path: string) => {
    router.push(path);
  };

  return (
    <main>
      <aside>
        <section className={styles.brand}>
          <img src="/logo.png" />
          <div className={styles.brandText}>
            <h1>Our Virtue</h1>
            <h2>An Introduction to God</h2>
          </div>
        </section>
        <section>
          <div className={styles.chapterList}>
            <ul>
              {poemList.map((chapter, i) => {
                return (
                  <li
                    key={`chapter${i}`}
                    className={
                      chapter.key === currentChapter ? styles.selected : ""
                    }
                    onClick={() => handleChapterClick(chapter.key)}
                  >
                    {chapter.title}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className={styles.poemList}>
            <ul>
              {currentPoems?.map((poem, i) => {
                return (
                  <li
                    key={`poem${i}`}
                    className={poem.path === pathname ? styles.selected : ""}
                    onClick={() => handlePoemClick(poem.path)}
                  >
                    {poem.title}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </aside>
      <article>{children}</article>
    </main>
  );
}
