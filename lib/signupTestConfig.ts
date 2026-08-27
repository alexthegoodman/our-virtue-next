// Stopping rule for the signup form personalization A/B test, defined up
// front per the test plan: stop once every variant has reached the sample
// size, or once the max duration has elapsed — whichever comes first.

export const SIGNUP_TEST_CONFIG = {
  sampleSizePerVariant: 150,
  startDate: "2026-08-27",
  maxDurationDays: 30,
} as const;

export function getSignupTestEndDate(): Date {
  const start = new Date(SIGNUP_TEST_CONFIG.startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + SIGNUP_TEST_CONFIG.maxDurationDays);
  return end;
}

export function isSignupTestConcluded(submissionsByVariant: number[]): boolean {
  const sampleSizeReached = submissionsByVariant.every(
    (count) => count >= SIGNUP_TEST_CONFIG.sampleSizePerVariant
  );
  const timeElapsed = new Date() >= getSignupTestEndDate();
  return sampleSizeReached || timeElapsed;
}
