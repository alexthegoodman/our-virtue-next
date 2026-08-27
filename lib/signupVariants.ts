// Shared source of truth for the signup form personalization A/B test.
// Used by both the client form and the server-side validation/reporting routes.

export const SIGNUP_VARIANTS = {
  A: {
    question: "How would you like to stay connected?",
    options: [
      "Read on my own",
      "Join a group at a set time",
      "Join a group on a flexible/async schedule",
      "In-person if available",
      "Not sure yet",
    ],
  },
  B: {
    question: "What are you most hoping to find here?",
    options: [
      "Community and connection",
      "Deeper study and teaching",
      "A way to serve/give back",
      "Personal comfort and peace",
      "Still figuring that out",
    ],
  },
  C: {
    question: "Where are you in your faith journey?",
    options: [
      "New or curious",
      "Skeptical, but open",
      "Devoted and growing",
      "Weary or distant",
      "Something else",
    ],
  },
} as const;

export type SignupVariantKey = keyof typeof SIGNUP_VARIANTS;

export const SIGNUP_VARIANT_KEYS = Object.keys(
  SIGNUP_VARIANTS
) as SignupVariantKey[];

export function isSignupVariantKey(value: unknown): value is SignupVariantKey {
  return (
    typeof value === "string" &&
    (SIGNUP_VARIANT_KEYS as string[]).includes(value)
  );
}

export function isValidSignupAnswer(
  variant: SignupVariantKey,
  answer: unknown
): answer is string {
  return (
    typeof answer === "string" &&
    (SIGNUP_VARIANTS[variant].options as readonly string[]).includes(answer)
  );
}

export function pickRandomSignupVariant(): SignupVariantKey {
  const index = Math.floor(Math.random() * SIGNUP_VARIANT_KEYS.length);
  return SIGNUP_VARIANT_KEYS[index];
}
