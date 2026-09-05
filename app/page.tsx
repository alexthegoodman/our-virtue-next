"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Cormorant_Garamond } from "next/font/google";
import posthog from "posthog-js";
import { poemList } from "@/content/poems";
import WhatsInsideModal from "@/components/WhatsInsideModal";
import * as fpixel from "@/lib/fpixel";
import { useAuth } from "@/contexts/AuthContext";
import { getCategoryDisplayName } from "@/lib/churchCategories";
import { getMemberCountLabel } from "@/lib/memberCountLabel";
import styles from "./page.module.css";

interface ChurchOption {
  id: string;
  name: string;
  slug: string;
  category: string;
  memberCount: number;
}

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

// const ENTRY_PATH = "/select-language";
const ENTRY_PATH = "/salvation/believe-in-god";

export default function Home() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [churches, setChurches] = useState<ChurchOption[]>([]);
  const [selectedChurchId, setSelectedChurchId] = useState("");
  const [introContent, setIntroContent] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">(
    "idle"
  );
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const totalPoems = poemList.reduce(
    (sum, chapter) => sum + chapter.items.length,
    0
  );

  useEffect(() => {
    fetch("/api/churches")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.churches) setChurches(data.churches);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setStatus("submitting");
    setError("");

    try {
      const response = await fetch("/api/email-subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "landing_gate",
          ...(selectedChurchId ? { churchId: selectedChurchId } : {}),
          ...(selectedChurchId && introContent.trim()
            ? { introContent: introContent.trim() }
            : {}),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong.");
      }

      const data = await response.json().catch(() => ({}));
      if (data?.account?.token && data?.account?.user) {
        login(data.account.token, data.account.user);
      }

      fpixel.event("Lead", { content_name: "landing_gate" });
      posthog.capture("signup_form_submitted", {
        churchId: selectedChurchId || undefined,
        postedIntro: Boolean(selectedChurchId && introContent.trim()),
      });

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
    <>
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

        {/* <p className={styles.copy}>
          The Secrets of the Kingdom of God are revealed to those who have faith in Jesus.
          Jesus is still alive today, bringing people closer to God! After I gave all my belongings away,
          I wrote this book, containing all the things I had heard from God over the 6 years previous.
          In this collection you will find strnegth in love and forgiveness and peace, with answers
          to questions on suffering, law, and science. You are welcome to read on, and see if I am correct!
          Email is offered to grow the community. Thank you.
        </p> */}

        <p className={styles.copy}>
          Are you looking for friends who share a faith in Jesus Christ? Do you crave
          a spiritual movement that emphasizes Jesus&apos; greatest teachings? Whether that
          be giving away all your belongings, or making peace in the face of violence,
          or loving your enemies. At Our Virtue meetings, we are focused on the Gospel, but place
          less emphasis on the other books in the Bible. <br />If this appeals to you, Welcome!<br />
          {/* You may enter your email below to connect and read our book which reiterates many of Jesus teachings
          for the sake of clarity and strength. */}
          Enter your email below to join a small group of regular people from all walks of life, living out Jesus&apos; teachings together. You&apos;ll also get access to our book, which explores many of these ideas further.
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
          </div>

          {churches.length > 0 && (
            <fieldset className={styles.question}>
              <legend className={styles.questionLabel}>
                Join a group that fits you
              </legend>
              <div className={styles.options}>
                {churches.map((church) => (
                  <label key={church.id} className={styles.option}>
                    <input
                      type="radio"
                      name="church"
                      value={church.id}
                      checked={selectedChurchId === church.id}
                      onChange={() => setSelectedChurchId(church.id)}
                      disabled={status === "submitting"}
                    />
                    <span>
                      {church.name} &middot;{" "}
                      {getCategoryDisplayName(church.category)} &middot;{" "}
                      {getMemberCountLabel(church.memberCount)}
                    </span>
                  </label>
                ))}
                <label className={styles.option}>
                  <input
                    type="radio"
                    name="church"
                    value=""
                    checked={selectedChurchId === ""}
                    onChange={() => setSelectedChurchId("")}
                    disabled={status === "submitting"}
                  />
                  <span>I&rsquo;ll decide later</span>
                </label>
              </div>
            </fieldset>
          )}

          {selectedChurchId && (
            <fieldset className={styles.question}>
              <legend className={styles.questionLabel}>
                Introduce yourself to the group
              </legend>
              <textarea
                className={styles.introTextarea}
                value={introContent}
                onChange={(e) => setIntroContent(e.target.value)}
                placeholder="Share a bit about yourself and what brought you here..."
                rows={3}
                maxLength={2000}
                disabled={status === "submitting"}
              />
            </fieldset>
          )}

          <button
            type="submit"
            className={styles.submit}
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Entering" : "Enter"}
          </button>

          {status === "error" && (
            <p className={styles.errorText}>{error}</p>
          )}
          <p className={styles.fineprint}>
            Get verses to your inbox every 3 days. You can set a password anytime from your profile.
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

    <section className={styles.about}>
      <div className={styles.aboutFrame}>
        <img
          src="/alex-woodman-our-virtue.jpg"
          alt="Alex Woodman, founder of Our Virtue"
          className={styles.aboutPhoto}
        />
        <span className={styles.aboutKicker}>About the Founder</span>
        <h2 className={`${styles.aboutName} ${serif.className}`}>
          Alex Woodman
        </h2>
        <p className={styles.aboutCopy}>
          I didn&rsquo;t arrive at this book through study. I arrived at it
          through fire. Across my life I&rsquo;ve walked through real
          suffering - loss, uncertainty, seasons where faith was the
          only thing left to hold onto. And in that fire, God kept showing
          up: answered prayers with no reasonable explanation, moments too
          specific and too timed to call coincidence. I can only call them
          miracles.
        </p>
        <p className={styles.aboutCopy}>
          Our Virtue grew out of those years. It isn&rsquo;t a theory about
          God - it&rsquo;s a record of what happened when I gave
          everything away and trusted Him with the rest.
        </p>
        <p className={styles.aboutCopy}>
          Now I&rsquo;m building something bigger than a book: a real
          community of faithful believers living out Jesus&rsquo; teachings
          together, in person, online, and in the quiet daily choices
          between. If that&rsquo;s you, I&rsquo;d love to have you along.
        </p>
        <span className={styles.aboutSignature}>
          &mdash; Alex, Founder of Our Virtue
        </span>
      </div>
    </section>
    </>
  );
}
