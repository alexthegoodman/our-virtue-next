"use client";

import { poemList } from "@/content/poems";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import styles from "./PrimaryLayout.module.css";
import { Link } from "react-aria-components";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./auth/AuthModal";

export default function PrimaryLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, login, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentSection, setCurrentSection] = useState("");
  const [currentChapter, setCurrentChapter] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      let slugs = pathname.split("/");
      console.info(slugs);
      setCurrentChapter(slugs[slugs.length - 1]);
      setCurrentSection(slugs[slugs.length - 2]);
    }
  }, [pathname]);

  const currentPoems = poemList.find(
    (chapter) => chapter.key === currentSection
  )?.items;

  const handleChapterClick = (key: string) => {
    setCurrentChapter(key);
  };

  const handlePoemClick = (path: string) => {
    router.push(path);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.left}>
          <section className={styles.brand}>
            <img src="/logo.png" />
            <div className={styles.brandText}>
              <h1>Our Virtue</h1>
              <h2>An Introduction to God</h2>
            </div>
          </section>
          <div className={styles.navLinks}>
            <Link href="/">Poems</Link>
            <Link href="/poverty-data">Poverty Data</Link>
            <Link href="/free-book">Free Book</Link>
            {user && user.isAdmin && (
              <Link href="/admin/book-requests">Book Requests</Link>
            )}
          </div>
        </div>
        <div className={styles.right}>
          {user ? (
            <div className={styles.userSection}>
              <span className={styles.username}>@{user.username}</span>
              <button onClick={logout} className={styles.logoutButton}>
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className={styles.loginButton}
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      <main className={styles.mainLayout}>
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
            {currentPoems && (
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
            )}
          </section>
        </aside>
        <article className={currentPoems ? styles.content : styles.fullContent}>
          {children}
        </article>
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={login}
      />
    </>
  );
}
