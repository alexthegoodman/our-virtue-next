"use client";

import { poemList } from "@/content/poems";
import { useRouter } from "next/navigation";
import styles from "./PoemsSummary.module.css";

interface CategorySummary {
  title: string;
  key: string;
  description: string;
  uniqueAspects: string[];
  themes: string[];
  poemCount: number;
}

const categorySummaries: CategorySummary[] = [
  {
    title: "Salvation",
    key: "salvation",
    description:
      "The foundation of faith - exploring belief in God, following Jesus, and the core practices of Christian life including forgiveness, love, generosity, and prayer.",
    uniqueAspects: [
      "Advocates for giving 'all you have to the poor' - beyond typical tithing",
      "Simple two-line mission statement that encapsulates the entire purpose",
      "Emphasizes personal relationship with God through direct prayer",
    ],
    themes: [
      "Faith",
      "Jesus as Savior",
      "Prayer",
      "Generosity",
      "Love",
      "Forgiveness",
      "Mission",
    ],
    poemCount: 8,
  },
  {
    title: "The Straight Path",
    key: "the-straight-path",
    description:
      "Practical virtue ethics for daily living - covering integrity, humility, family relationships, wise speech, righteous judgment, and consistent moral behavior.",
    uniqueAspects: [
      "Most comprehensive category with detailed guidance for daily life",
      "Emphasizes secret good deeds without seeking recognition",
      "Integrates family respect with broader community ethics",
    ],
    themes: [
      "Integrity",
      "Humility",
      "Self-control",
      "Family respect",
      "Wise speech",
      "Righteousness",
      "Consistency",
    ],
    poemCount: 12,
  },
  {
    title: "Being Together",
    key: "being-together",
    description:
      "Community and relationships - emphasizing understanding, peace-making, trust, taking responsibility, and following Jesus as the divine physician.",
    uniqueAspects: [
      "Uniquely presents Jesus as 'The Doctor' who touches the unclean",
      "Emphasizes self-blame and responsibility-taking in conflicts",
      "Focuses on positive reinforcement and building others up",
    ],
    themes: [
      "Empathy",
      "Peace-making",
      "Trust",
      "Self-reflection",
      "Community healing",
      "Encouragement",
    ],
    poemCount: 6,
  },
  {
    title: "The Way",
    key: "the-way",
    description:
      "The spiritual journey and evangelism - accepting hardship for doing good, choosing light over darkness, hoping in eternal life, and spreading the gospel through love.",
    uniqueAspects: [
      "Respectfully acknowledges both Christian and Islamic practices",
      "Emphasizes sharing these specific poems as evangelism method",
      "Balances present action with eternal perspective",
    ],
    themes: [
      "Spiritual cost",
      "Goodness vs worldly success",
      "Hope",
      "Evangelism",
      "Light vs darkness",
      "Eternal values",
    ],
    poemCount: 8,
  },
  {
    title: "Authority",
    key: "authority",
    description:
      "Leadership and governance - divine authority, servant leadership, sexual ethics, justice balanced with mercy, and the responsibility that comes with power.",
    uniqueAspects: [
      "Explicitly addresses sexual ethics with unusual directness for religious poetry",
      "Warns against sinful leaders while promoting servant leadership",
      "Balances justice with compassion in judgment",
    ],
    themes: [
      "Servant leadership",
      "Sexual ethics",
      "Justice",
      "Mercy",
      "Divine authority",
      "Moral boundaries",
    ],
    poemCount: 5,
  },
  {
    title: "Suffering",
    key: "suffering",
    description:
      "Enduring hardship with faith - finding strength through prayer, understanding trauma's effects, maintaining hope in despair, and viewing righteousness as escape from darkness.",
    uniqueAspects: [
      "Addresses trauma's effects with compassionate understanding",
      "Emphasizes God's special advocacy for the poor and suffering",
      "Provides concrete hope for escape from difficult circumstances",
    ],
    themes: [
      "Patient endurance",
      "Prayer for strength",
      "Trauma awareness",
      "Hope in trials",
      "Divine advocacy",
    ],
    poemCount: 5,
  },
  {
    title: "Worry and Painful Thoughts",
    key: "worry-and-painful-thoughts",
    description:
      "Mental and emotional well-being - overcoming destructive emotions, finding contentment in loss, replacing worry with hope, and recognizing spiritual warfare.",
    uniqueAspects: [
      "Directly addresses mental health concerns with spiritual solutions",
      "Acknowledges Satan's influence while providing protection through prayer",
      "Finds peace and contentment even in poverty and loss",
    ],
    themes: [
      "Emotional healing",
      "Contentment",
      "Spiritual warfare",
      "Peace",
      "Acceptance",
      "Divine protection",
    ],
    poemCount: 4,
  },
  {
    title: "His Design",
    key: "his-design",
    description:
      "Free will and divine purpose - the responsibility of choice, trusting in God's power to overcome fear, and prioritizing eternal over temporal matters.",
    uniqueAspects: [
      "Clearly emphasizes individual responsibility and free will",
      "Links courage directly to trust in God's healing power",
      "Distinguishes between spiritual and material priorities",
    ],
    themes: [
      "Free will",
      "Individual responsibility",
      "Divine healing",
      "Courage",
      "Eternal priorities",
    ],
    poemCount: 3,
  },
  {
    title: "Substances and Health",
    key: "substances-and-health",
    description:
      "Physical well-being and self-care - avoiding addiction, maintaining health as stewardship, and practicing moderation with substances.",
    uniqueAspects: [
      "Integrates modern scientific understanding with faith",
      "Addresses addiction with both spiritual and practical perspectives",
      "Presents body care as spiritual stewardship",
    ],
    themes: [
      "Health stewardship",
      "Addiction prevention",
      "Moderation",
      "Scientific awareness",
      "Self-control",
    ],
    poemCount: 3,
  },
  {
    title: "The People",
    key: "the-people",
    description:
      "Religious community and scripture - the role of prophets, the supremacy of the Gospel, and emphasizing personal faith over institutional religion.",
    uniqueAspects: [
      "Places Jesus uniquely above all other prophets",
      "Asserts Gospel's supremacy over other religious texts",
      "Emphasizes mind as the 'first church' over institutional religion",
    ],
    themes: [
      "Jesus' uniqueness",
      "Gospel supremacy",
      "Personal faith",
      "Prophetic tradition",
      "Individual spirituality",
    ],
    poemCount: 3,
  },
  {
    title: "Evildoers and Wicked People",
    key: "evildoers-and-wicked-people",
    description:
      "Dealing with evil and oppression - maintaining faith during persecution, understanding evil's origin while recognizing light, and trusting in divine justice for the oppressed.",
    uniqueAspects: [
      "Directly condemns slavery and oppression",
      "Maintains hope for light even in those who do evil",
      "Provides comfort for those facing persecution for their faith",
    ],
    themes: [
      "Persecution endurance",
      "Divine justice",
      "Anti-oppression",
      "Light in darkness",
      "Faith under attack",
    ],
    poemCount: 3,
  },
];

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
          {categorySummaries.length} categories, bridging traditional Christian
          teaching with contemporary social concerns
        </p> */}
      </header>

      <section className={styles.uniqueInfo}>
        <div className={styles.right}>
          <h3>What you already know from Our Virtue</h3>
          <ul>
            <li>Jesus is the Messiah, the Son of God, and the Savior of Mankind</li>
            <li>Faith can move mountains</li>
            <li>Love is the greatest commandment</li>
            <li>Forgiving others is the way to God&apos;s forgiveness</li>
            <li>Evil people have light in them and God cares for them also</li>
            <li>God&apos;s Children are peacemakers</li>
          </ul>
          <div className={styles.why}>
            <p>You may wonder what is the point to Our Virtue?</p>
            <p><strong>It&apos;s for those who desire the whole truth, even if it is a lot to ask, so they can truly experience God - not a lukewarm appeasement or appeal, which has become most popular today</strong></p>
          </div>
        </div>
        <div className={styles.left}>
          <h3>What Makes Our Virtue Unique</h3>
          <ul>
            <li>Our Virtue encourages hard work, daily, for the sake of God and the poor</li>
            <li>Our Virtue admonishes churches for investing in themselves more than they give back, and encourages churches to keep politics out of sermons (God is greater than any President, and faith more important than any policy)</li>
            <li>Our Virtue asks that people do not fight back or war with each other, even in the face of violent attacks</li>
            <li>Our Virtue teaches a moderate, yet very strong, view on sexual ethics, substances, and righteous law</li>
            <li>Our Virtue teaches constant forgiveness, yet to uphold the law of the land, for all people must decide where they draw the line between mercy and justice, and God will judge them accordingly</li>
            <li>Our Virtue doesn&apos;t hide from Jesus true teachings, but instead teaches them to the fullest</li>
            <li>Our Virtue doesn&apos;t want you to be alone on your path to saving the world from suffering, but to provide you with a way to accelerate your mission</li>
            <li>Our Virtue calls those who want to dedicate their lives to giving back, giving them brothers and sisters who are equally devoted</li>
            <li>Our Virtue asks that most people give all they have to the poor, out of faith, without fear or greed</li>
            <li>Our Virtue teaches that only Jesus comes with the true Word of God, and all other Prophets, including Moses and Muhammad, received their revelations from angels only</li>
            <li>Our Virtue asks that you share it with your children, bringing God&apos;s glory to fill your house, and carrying the sacred mission forward for generations to come</li>
          </ul>
        </div>
      </section>

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
