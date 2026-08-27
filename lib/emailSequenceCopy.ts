import { SignupVariantKey } from "@/lib/signupVariants";

export interface EmailSequenceCopy {
  subject: string;
  heading: string;
  paragraphs: string[];
}

// Personalized follow-up copy, keyed by variant then by the exact option
// text the subscriber selected. Every option in lib/signupVariants.ts has
// an entry here.
export const EMAIL_SEQUENCE_COPY: Record<
  SignupVariantKey,
  Record<string, EmailSequenceCopy>
> = {
  A: {
    "Read on my own": {
      subject: "Reading at your own pace",
      heading: "However you read, welcome",
      paragraphs: [
        "You told us you'd rather read on your own for now — that's a good way to begin.",
        "Here's where to start: the introduction, then whichever poem's title speaks to you first. There's no wrong order.",
        "If you ever want company along the way, just reply to this email. We're glad you're here.",
      ],
    },
    "Join a group at a set time": {
      subject: "Let's find you a group",
      heading: "A place to read together, on a schedule",
      paragraphs: [
        "You said you'd like to join a group at a set time — we're building those now.",
        "We'll follow up as soon as a group forms in your area or time zone. In the meantime, feel free to start reading on your own.",
        "Reply and let us know your general time zone and any days that work best, and we'll take that into account.",
      ],
    },
    "Join a group on a flexible/async schedule": {
      subject: "A flexible way to study together",
      heading: "Study together, on your own time",
      paragraphs: [
        "You chose a flexible, async group — a good fit if your schedule doesn't bend easily.",
        "We're putting together a space where people can share reflections on their own time and still feel connected.",
        "We'll email you as soon as it's ready. Until then, we'd love to hear what drew you here — just reply.",
      ],
    },
    "In-person if available": {
      subject: "Looking for something in-person?",
      heading: "We'll let you know what's near you",
      paragraphs: [
        "You said you'd prefer something in-person if it's available.",
        "We're still growing, so in-person gatherings aren't everywhere yet — but we're tracking interest by area.",
        "Reply with your general location and we'll reach out the moment something starts near you.",
      ],
    },
    "Not sure yet": {
      subject: "No rush — here's a place to start",
      heading: "Take your time",
      paragraphs: [
        "You're not sure yet how you'd like to stay connected, and that's completely fine.",
        "Start with the reading itself. The way you want to connect usually becomes clear on its own.",
        "Whenever you're ready for more — a group, a conversation, anything — just reply.",
      ],
    },
  },
  B: {
    "Community and connection": {
      subject: "You're not meant to walk this alone",
      heading: "Community and connection",
      paragraphs: [
        "You told us you're hoping to find community and connection here — that matters to us too.",
        "We're building spaces for people to talk, ask questions, and walk through this together.",
        "Reply and tell us a little about yourself. It's the first step toward the community you're looking for.",
      ],
    },
    "Deeper study and teaching": {
      subject: "For those hungry to go deeper",
      heading: "Deeper study and teaching",
      paragraphs: [
        "You're looking for deeper study and teaching, so we won't keep this light.",
        "Start with the poems that deal with law, suffering, and scripture directly — they're written to hold up under real questions.",
        "We'll send along further study material as it's ready. Reply anytime with questions; we mean that.",
      ],
    },
    "A way to serve/give back": {
      subject: "Ways to serve, right where you are",
      heading: "A way to serve and give back",
      paragraphs: [
        "You said you're hoping to find a way to serve and give back — that says a lot about where your heart is.",
        "We're building out ways for people to help each other, from small acts to organized efforts. We'll keep you posted.",
        "If you already have an idea of how you'd like to serve, reply and tell us — we'd love to hear it.",
      ],
    },
    "Personal comfort and peace": {
      subject: "A little peace for today",
      heading: "Personal comfort and peace",
      paragraphs: [
        "You told us you're hoping to find personal comfort and peace right now.",
        "Start with the poems on suffering and forgiveness — they were written for exactly what you're carrying.",
        "If things are heavy right now, reply and let us know. We'd rather hear from you than have you read alone.",
      ],
    },
    "Still figuring that out": {
      subject: "That's more than okay",
      heading: "Still figuring it out",
      paragraphs: [
        "You're still figuring out what you're hoping to find here — most people are.",
        "Just start reading. Whatever you're looking for tends to find you along the way.",
        "Whenever something resonates, or you want to talk it through, reply. We're listening.",
      ],
    },
  },
  C: {
    "New or curious": {
      subject: "Glad you're here, however you got here",
      heading: "New or curious",
      paragraphs: [
        "You said you're new or just curious — that's exactly the right place to start.",
        "Begin with the introduction and take it slow. Nobody expects you to have this figured out yet.",
        "Questions are always welcome. Reply anytime, no matter how basic it feels.",
      ],
    },
    "Skeptical, but open": {
      subject: "Questions are welcome",
      heading: "Skeptical, but open",
      paragraphs: [
        "You told us you're skeptical, but open — honestly, that's a good place to read from.",
        "This collection doesn't ask you to set your questions aside. It was written to meet them directly, especially around law, science, and suffering.",
        "Push back if something doesn't land. Reply with your hardest question — we'd rather answer it than avoid it.",
      ],
    },
    "Devoted and growing": {
      subject: "Keep going deeper",
      heading: "Devoted and growing",
      paragraphs: [
        "You're devoted and growing — we're glad to walk further with you.",
        "You may want to move quickly past the introductory pieces into the deeper stanzas on scripture and law.",
        "If you're looking to go further still, reply — we can point you to what fits where you are.",
      ],
    },
    "Weary or distant": {
      subject: "If you're tired, this is for you",
      heading: "Weary or distant",
      paragraphs: [
        "You said you're feeling weary or distant right now. Thank you for saying so.",
        "Start with the poems on forgiveness and rest. They weren't written for people who have it all together.",
        "You don't have to reply, but if you want to, we're here and we'll read every word.",
      ],
    },
    "Something else": {
      subject: "Wherever you are, welcome",
      heading: "Something else entirely",
      paragraphs: [
        "You told us your faith journey is something else — fair enough, not everyone fits the usual categories.",
        "Read at your own pace and see what stands out to you. We'd genuinely like to hear how you'd describe it.",
        "Reply anytime and tell us more. We're glad you're here either way.",
      ],
    },
  },
};

export function getEmailSequenceCopy(
  variant: SignupVariantKey,
  answer: string
): EmailSequenceCopy | null {
  return EMAIL_SEQUENCE_COPY[variant]?.[answer] ?? null;
}
