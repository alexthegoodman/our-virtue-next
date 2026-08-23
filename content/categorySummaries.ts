export interface CategorySummary {
  title: string;
  key: string;
  description: string;
  uniqueAspects: string[];
  themes: string[];
  poemCount: number;
}

export const categorySummaries: CategorySummary[] = [
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
