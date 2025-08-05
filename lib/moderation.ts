import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ModerationResult {
  isAppropriate: boolean;
  reason?: string;
  confidence: number;
}

export async function moderateContent(
  content: string
): Promise<ModerationResult> {
  try {
    // If no OpenAI key is configured, allow all content
    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY === "your-openai-api-key-here"
    ) {
      return { isAppropriate: true, confidence: 0 };
    }

    // Use OpenAI's moderation endpoint
    const moderation = await openai.moderations.create({
      input: content,
    });

    const result = moderation.results[0];

    if (result.flagged) {
      const flaggedCategories = Object.entries(result.categories)
        .filter(([_, flagged]) => flagged)
        .map(([category]) => category);

      return {
        isAppropriate: false,
        reason: `Content flagged for: ${flaggedCategories.join(", ")}`,
        confidence: Math.max(...Object.values(result.category_scores)) * 100,
      };
    }

    // Additional custom checks for religious context
    const customCheck = await performCustomModerationCheck(content);
    if (!customCheck.isAppropriate) {
      return customCheck;
    }

    return { isAppropriate: true, confidence: 95 };
  } catch (error) {
    console.error("Moderation error:", error);
    // On error, err on the side of caution but don't block content entirely
    return { isAppropriate: true, confidence: 0 };
  }
}

async function performCustomModerationCheck(
  content: string
): Promise<ModerationResult> {
  try {
    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY === "your-openai-api-key-here"
    ) {
      return { isAppropriate: true, confidence: 0 };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a content moderator for a Christian poetry discussion platform called "Our Virtue". 
          
          The platform features religious poetry about virtues, faith, and spiritual guidance. Users discuss the meaning and application of these poems.
          
          Your job is to determine if user-generated content is appropriate for this context. 
          
          APPROVE content that:
          - Discusses faith, spirituality, and religious topics respectfully
          - Shares personal experiences related to faith
          - Asks genuine questions about religious concepts
          - Offers encouragement and support
          - Engages thoughtfully with the poetry's themes
          
          FLAG content that:
          - Contains hate speech or attacks on any religious group
          - Is spam or promotional
          - Contains explicit sexual content
          - Promotes violence or illegal activities
          - Is completely off-topic from spiritual/religious discussion
          - Contains personal attacks or harassment
          
          Respond with only "APPROPRIATE" or "INAPPROPRIATE: [reason]"`,
        },
        {
          role: "user",
          content: content,
        },
      ],
      max_tokens: 100,
      temperature: 0.1,
    });

    const result = response.choices[0]?.message?.content?.trim() || "";

    if (result.startsWith("INAPPROPRIATE:")) {
      const reason = result.replace("INAPPROPRIATE:", "").trim();
      return {
        isAppropriate: false,
        reason: reason || "Content not suitable for this platform",
        confidence: 85,
      };
    }

    return { isAppropriate: true, confidence: 85 };
  } catch (error) {
    console.error("Custom moderation error:", error);
    return { isAppropriate: true, confidence: 0 };
  }
}

// Rate limiting helper
const userPostTimes = new Map<string, number[]>();

export function checkRateLimit(
  userId: string,
  windowMs: number = 60000,
  maxPosts: number = 5
): boolean {
  const now = Date.now();
  const userTimes = userPostTimes.get(userId) || [];

  // Remove posts outside the time window
  const recentTimes = userTimes.filter((time) => now - time < windowMs);

  if (recentTimes.length >= maxPosts) {
    return false; // Rate limit exceeded
  }

  // Add current post time
  recentTimes.push(now);
  userPostTimes.set(userId, recentTimes);

  return true; // Within rate limit
}

// Spam detection based on content patterns
export function detectSpam(content: string): {
  isSpam: boolean;
  reason?: string;
} {
  // Check for excessive links
  const linkCount = (content.match(/https?:\/\/\S+/g) || []).length;
  if (linkCount > 3) {
    return { isSpam: true, reason: "Too many links" };
  }

  // Check for excessive capitalization
  const capsPercentage =
    (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsPercentage > 0.7 && content.length > 20) {
    return { isSpam: true, reason: "Excessive capitalization" };
  }

  // Check for repeated characters
  if (/(.)\1{10,}/.test(content)) {
    return { isSpam: true, reason: "Repeated characters" };
  }

  // Check for common spam phrases
  const spamPhrases = [
    "buy now",
    "click here",
    "make money",
    "free money",
    "get rich",
    "viagra",
    "casino",
    "lottery",
    "winner",
    "congratulations you",
  ];

  const lowerContent = content.toLowerCase();
  for (const phrase of spamPhrases) {
    if (lowerContent.includes(phrase)) {
      return { isSpam: true, reason: "Contains spam keywords" };
    }
  }

  return { isSpam: false };
}
