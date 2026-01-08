"use client";

import { poemList } from "@/content/poems";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import styles from "./PrimaryLayout.module.css";
import { Link } from "react-aria-components";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./auth/AuthModal";
import SearchBar from "./SearchBar";

export default function CategoryLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, login, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState("");
  const [currentChapter, setCurrentChapter] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      let slugs = pathname.split("/").filter((slug) => slug !== "");
      console.info(slugs);

      // Check if first slug is a language code
      const supportedLanguages = [
        "ar",
        "bn",
        "es",
        "fr",
        "hi",
        "id",
        "ko",
        "ur",
        "zh",
      ];
      const isLanguagePath = supportedLanguages.includes(slugs[0]);

      if (isLanguagePath) {
        setCurrentLanguage(slugs[0]);
        setCurrentChapter(slugs[slugs.length - 1]);
        setCurrentSection(slugs[slugs.length - 2]);
      } else {
        setCurrentLanguage("en");
        setCurrentChapter(slugs[slugs.length - 1]);
        setCurrentSection(slugs[slugs.length - 2]);
      }
    }
  }, [pathname]);

  const currentPoems = poemList.find(
    (chapter) => chapter.key === currentSection
  )?.items;

  const handleChapterClick = (key: string) => {
    // setCurrentChapter(key);
    setCurrentSection(key);
  };

  const handlePoemClick = (path: string) => {
    const finalPath =
      currentLanguage === "en" ? path : `/${currentLanguage}${path}`;
    router.push(finalPath);
  };

  return (
    <>
      <main className={styles.mainLayout}>
        {currentPoems && (
          <aside className={styles.sidebar}>
            <section>
              <div className={styles.chapterList}>
                <ul>
                  {poemList.map((chapter, i) => {
                    return (
                      <li
                        key={`chapter${i}`}
                        className={
                          chapter.key === currentSection ? styles.selected : ""
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
                        className={
                          poem.path === `/${currentSection}/${currentChapter}`
                            ? styles.selected
                            : ""
                        }
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
        )}
        <article className={currentPoems ? styles.content : styles.fullContent}>
          {children}
        </article>
      </main>
    </>
  );
}
