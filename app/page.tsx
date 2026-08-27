"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cormorant_Garamond } from "next/font/google";
import posthog from "posthog-js";
import { poemList } from "@/content/poems";
import WhatsInsideModal from "@/components/WhatsInsideModal";
import * as fpixel from "@/lib/fpixel";
import { useSignupVariant } from "@/hooks/useSignupVariant";
import { SIGNUP_VARIANTS } from "@/lib/signupVariants";
import styles from "./page.module.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

// const ENTRY_PATH = "/select-language";
const ENTRY_PATH = "/salvation/believe-in-god";

export default function Home() {
  const router = useRouter();
  const variant = useSignupVariant();
  const [email, setEmail] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">(
    "idle"
  );
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const totalPoems = poemList.reduce(
    (sum, chapter) => sum + chapter.items.length,
    0
  );

  const variantConfig = variant ? SIGNUP_VARIANTS[variant] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variant || !answer) return;

    setStatus("submitting");
    setError("");

    try {
      const response = await fetch("/api/email-subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "landing_gate",
          variant,
          answer,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong.");
      }

      fpixel.event("Lead", { content_name: "landing_gate" });
      posthog.capture("signup_form_submitted", { variant, answer });

      router.push(ENTRY_PATH);
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  };

  const handleSkip = () => {
    router.push(ENTRY_PATH);
  };

  return (
    <div className={styles.page}>
      <div className={styles.frame}>
        <div className={styles.brand}>
          <img
            src="/logo.png"
            alt="Our Virtue"
            className={styles.logo}
          />
          <span className={styles.kicker}>Our Virtue</span>
        </div>

        <div className={styles.rule} />

        <h1 className={`${styles.title} ${serif.className}`}>
          An Introduction to God
        </h1>

        {/* <p className={styles.copy}>
          Our Virtue was inspired by prophetic revelations gathered over a
          period of six to seven years, then written down over the course of
          a single year. These revelations confirm the Gospel as the sole
          Word of God and put to rest many questions surrounding law,
          science, and suffering.
        </p> */}

        <p className={styles.copy}>
          The Secrets of the Kingdom of God are revealed to those who have faith in Jesus.
          Jesus is still alive today, bringing people closer to God! After I gave all my belongings away,
          I wrote this book, containing all the things I had heard from God over the 6 years previous.
          In this collection you will find strnegth in love and forgiveness and peace, with answers
          to questions on suffering, law, and science. You are welcome to read on, and see if I am correct!
          Email is offered to grow the community. Thank you.
        </p>

        <button
          className={styles.details}
          onClick={() => setShowModal(true)}
          type="button"
        >
          See what&rsquo;s inside
        </button>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="email" className={styles.label}>
            Enter your email to begin
          </label>
          <div className={styles.inputRow}>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={status === "submitting"}
              className={styles.input}
            />
            <button
              type="submit"
              className={styles.submit}
              disabled={status === "submitting" || !variant || !answer}
            >
              {status === "submitting" ? "Entering" : "Enter"}
            </button>
          </div>

          {variantConfig && (
            <fieldset className={styles.question}>
              <legend className={styles.questionLabel}>
                {variantConfig.question}
              </legend>
              <div className={styles.options}>
                {variantConfig.options.map((option) => (
                  <label key={option} className={styles.option}>
                    <input
                      type="radio"
                      name="signup-answer"
                      value={option}
                      checked={answer === option}
                      onChange={() => setAnswer(option)}
                      disabled={status === "submitting"}
                      required
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {status === "error" && (
            <p className={styles.errorText}>{error}</p>
          )}
          <p className={styles.fineprint}>
            Used to build relationships and community with you and others.
          </p>
        </form>

        <div className={styles.stats}>
          <span>{totalPoems} Poems</span>
          <span className={styles.dot}>&middot;</span>
          <span>{poemList.length} Categories</span>
          <span className={styles.dot}>&middot;</span>
          <span>10 Languages</span>
        </div>

        <button className={styles.skip} onClick={handleSkip} type="button">
          Skip and continue without email
        </button>
      </div>

      <WhatsInsideModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
