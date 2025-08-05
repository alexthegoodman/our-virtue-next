"use client";

import { poemList } from "@/content/poems";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import styles from "./PrimaryLayout.module.css";
import { Link } from "react-aria-components";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./auth/AuthModal";
import SearchBar from "./SearchBar";

export default function PrimaryLayout({ children }: { children: ReactNode }) {
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
      <header className={styles.header}>
        <div className={styles.left}>
          <section className={styles.brand}>
            <img src="/logo.png" alt="Our Virtue Logo" />
            <div className={styles.brandText}>
              <h1>Our Virtue</h1>
              <h2>An Introduction to God</h2>
            </div>
          </section>
          <div className={styles.navLinks}>
            <Link href="/select-language">Poems</Link>
            <Link href="/poverty-data">Poverty Data</Link>
            <Link href="/free-book">Free Book</Link>
            <Link href="/churches">
              Churches <span className={styles.badge}>New</span>
            </Link>
            {user && user.isAdmin && (
              <Link href="/admin/book-requests">Book Requests</Link>
            )}
            {/* <SearchBar
              showButton={true}
              buttonText="Search poems"
              currentLanguage={currentLanguage}
              placeholder="Search in natural language..."
            /> */}
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.desktopAuth}>
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
          <button
            className={styles.hamburgerButton}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileNavLinks}>
            <span
              // href="/select-language"
              // onPressEnd={() => setIsMobileMenuOpen(false)}
              onClick={() => {
                setIsMobileMenuOpen(false);
                router.push("/select-language");
              }}
            >
              Poems
            </span>
            <span
              // href="/poverty-data"
              // onPressEnd={() => setIsMobileMenuOpen(false)}
              onClick={() => {
                setIsMobileMenuOpen(false);
                router.push("/poverty-data");
              }}
            >
              Poverty Data
            </span>
            <span
              // href="/free-book"
              // onPressEnd={() => setIsMobileMenuOpen(false)}
              onClick={() => {
                setIsMobileMenuOpen(false);
                router.push("/free-book");
              }}
            >
              Free Book
            </span>
            <span
              // href="/churches"
              // onPressEnd={() => setIsMobileMenuOpen(false)}
              onClick={() => {
                setIsMobileMenuOpen(false);
                router.push("/churches");
              }}
            >
              Churches <span className={styles.badge}>New</span>
            </span>
            {user && user.isAdmin && (
              <span
                // href="/admin/book-requests"
                // onPressEnd={() => setIsMobileMenuOpen(false)}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push("/admin/book-requests");
                }}
              >
                Book Requests
              </span>
            )}
          </div>
          {/* <div className={styles.mobileSearchContainer}>
            <SearchBar
              showButton={true}
              buttonText="Search poems"
              currentLanguage={currentLanguage}
              placeholder="Search in natural language..."
            />
          </div> */}
          <div className={styles.mobileAuth}>
            {user ? (
              <div className={styles.userSection}>
                <span className={styles.username}>@{user.username}</span>
                <button onClick={logout} className={styles.logoutButton}>
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowAuthModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className={styles.loginButton}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}

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

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={login}
      />
    </>
  );
}
