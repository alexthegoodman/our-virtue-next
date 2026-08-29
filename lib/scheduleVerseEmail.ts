// Recurring verse email cadence. Configurable via env in case we ever want
// to tune it without a code change.

const INTERVAL_DAYS = parseInt(
  process.env.VERSE_EMAIL_INTERVAL_DAYS || "3",
  10
);

// First verse email lands a day after signup, so it doesn't stack with the
// personalized follow-up email from the signup sequence.
const FIRST_SEND_DELAY_DAYS = parseInt(
  process.env.VERSE_EMAIL_FIRST_SEND_DELAY_DAYS || "1",
  10
);

function addDays(from: Date, days: number): Date {
  const result = new Date(from);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function computeFirstVerseEmailTime(from: Date = new Date()): Date {
  return addDays(from, FIRST_SEND_DELAY_DAYS);
}

export function computeNextVerseEmailTime(from: Date = new Date()): Date {
  return addDays(from, INTERVAL_DAYS);
}
