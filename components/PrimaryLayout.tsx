"use client";

import { poemList } from "@/content/poems";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

export default function PrimaryLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [currentChapter, setCurrentChapter] = useState(
    window.location.pathname.split("/")[1]
  );

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
        <section>
          <div>
            <ul>
              {poemList.map((chapter, i) => {
                return (
                  <li
                    key={`chapter${i}`}
                    onClick={() => handleChapterClick(chapter.key)}
                  >
                    {chapter.title}
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <ul>
              {currentPoems?.map((poem, i) => {
                return (
                  <li
                    key={`poem${i}`}
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
