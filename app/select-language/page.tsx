"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
];

export default function SelectLanguage() {
  const router = useRouter();

  const handleLanguageSelect = (languageCode: string) => {
    if (languageCode === "en") {
      router.push("/salvation/believe-in-god");
    } else {
      router.push(`/${languageCode}/salvation/believe-in-god`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Select Your Language</h1>
        <p className={styles.subtitle}>Choose a language to read Our Virtue</p>
        
        <div className={styles.languageGrid}>
          {languages.map((language) => (
            <button
              key={language.code}
              className={styles.languageCard}
              onClick={() => handleLanguageSelect(language.code)}
            >
              <div className={styles.languageName}>{language.name}</div>
              <div className={styles.languageNative}>{language.nativeName}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}