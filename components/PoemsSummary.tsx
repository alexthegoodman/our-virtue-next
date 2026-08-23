"use client";

import { poemList } from "@/content/poems";
import { categorySummaries } from "@/content/categorySummaries";
import { useRouter } from "next/navigation";
import styles from "./PoemsSummary.module.css";

export default function PoemsSummary() {
  const router = useRouter();

  const handleCategoryClick = (key: string) => {
    const firstPoem = poemList.find((category) => category.key === key)
      ?.items[0];
    if (firstPoem) {
      router.push(firstPoem.path);
    }
  };

  const totalPoems = categorySummaries.reduce(
    (sum, cat) => sum + cat.poemCount,
    0
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Welcome to Our Virtue</h1>
        {/* <p className={styles.subtitle}>
          A modern collection of {totalPoems} devotional poems across{" "}
          {categorySummaries.length} categories, intended as an introduction to God.
        </p> */}
        <p className={styles.subtitle}>
          Our Virtue was inspired by prophetic revelations from a 6-7 year period, then written down
          over the course of a single year. These revelations confirmed the Gospel as the sole Word of God.
          These poems put to rest many issues surrounding law, science, and suffering. <br />
          The revelations cannot be proven perfect, but you will find secrets of the Kingdom in every poem.
        </p>
      </header>

      <section className={styles.categories}>
        <h2>Explore by Category</h2>
        <div className={styles.categoryGrid}>
          {categorySummaries.map((category) => (
            <div
              key={category.key}
              className={styles.categoryCard}
              onClick={() => handleCategoryClick(category.key)}
              role="button"
              tabIndex={0}
            >
              <div className={styles.categoryHeader}>
                <h3>{category.title}</h3>
                <span className={styles.poemCount}>
                  {category.poemCount} poems
                </span>
              </div>

              <p className={styles.description}>{category.description}</p>

              <div className={styles.themes}>
                <h4>Key Themes:</h4>
                <div className={styles.themeList}>
                  {category.themes.map((theme, index) => (
                    <span key={index} className={styles.theme}>
                      {theme}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.uniqueAspects}>
                <h4>What&apos;s Unique:</h4>
                <ul>
                  {category.uniqueAspects.map((aspect, index) => (
                    <li key={index}>{aspect}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.explore}>Click to explore →</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.overview}>
        <h2>What Makes This Collection Unique</h2>
        <div className={styles.uniqueFeatures}>
          <div className={styles.feature}>
            <h3>Contemporary Language</h3>
            <p>
              Uses modern analogies alongside ancient wisdom - from internet
              metaphors to scientific awareness
            </p>
          </div>
          <div className={styles.feature}>
            <h3>Practical Application</h3>
            <p>
              Each poem provides concrete, actionable guidance rather than
              abstract theology
            </p>
          </div>
          <div className={styles.feature}>
            <h3>Social Justice Focus</h3>
            <p>
              Strong emphasis on serving the poor and oppressed as primary
              religious duty
            </p>
          </div>
          <div className={styles.feature}>
            <h3>Progressive Integration</h3>
            <p>
              Addresses modern issues like addiction, mental health, and
              scientific literacy within faith context
            </p>
          </div>
        </div>
      </section>

      <section className={styles.framework}>
        <h2>Spiritual Framework</h2>
        <div className={styles.frameworkGrid}>
          <div className={styles.frameworkItem}>
            <h3>Christocentric</h3>
            <p>
              Jesus Christ is central as Savior, teacher, and only path to God
            </p>
          </div>
          <div className={styles.frameworkItem}>
            <h3>Practical Mysticism</h3>
            <p>Inner spiritual life combined with outer social action</p>
          </div>
          <div className={styles.frameworkItem}>
            <h3>Social Justice</h3>
            <p>Serving the poor and oppressed as primary religious duty</p>
          </div>
          <div className={styles.frameworkItem}>
            <h3>Non-violence</h3>
            <p>
              Consistent advocacy for peace, forgiveness, and turning the other
              cheek
            </p>
          </div>
          <div className={styles.frameworkItem}>
            <h3>Personal Relationship</h3>
            <p>
              Direct, individual relationship with God through prayer and
              practice
            </p>
          </div>
          <div className={styles.frameworkItem}>
            <h3>Universal Access</h3>
            <p>
              Simple language and concepts available to all education levels
            </p>
          </div>
        </div>
      </section>

      <section className={styles.patterns}>
        <h2>Recurring Messages</h2>
        <div className={styles.patternsList}>
          <div className={styles.pattern}>
            <strong>God&apos;s Special Care for the Poor:</strong> Appears
            consistently across all categories
          </div>
          <div className={styles.pattern}>
            <strong>Humility Over Pride:</strong> Emphasis on lowering oneself
            and servant leadership
          </div>
          <div className={styles.pattern}>
            <strong>Inner Transformation:</strong> Change must come from the
            heart, not external compliance
          </div>
          <div className={styles.pattern}>
            <strong>Love as Supreme Virtue:</strong> Love of God and neighbor as
            highest calling
          </div>
          <div className={styles.pattern}>
            <strong>Practical Faith:</strong> Religion must be lived through
            daily actions
          </div>
          <div className={styles.pattern}>
            <strong>Future Hope:</strong> Balance between present action and
            eternal perspective
          </div>
        </div>
      </section>
    </div>
  );
}
