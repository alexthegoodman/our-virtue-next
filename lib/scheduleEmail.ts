// Picks a random future send time for the personalized follow-up email,
// constrained to a "daytime" window so nobody gets emailed at 3am.
// Window is expressed in UTC hours (defaults approximate 9am-7pm US Eastern);
// override via env if the audience skews to another timezone.

const MIN_DAY_OFFSET = 0;
const MAX_DAY_OFFSET = 2;

const WINDOW_START_HOUR_UTC = parseInt(
  process.env.EMAIL_SEND_WINDOW_START_HOUR_UTC || "13",
  10
);
const WINDOW_END_HOUR_UTC = parseInt(
  process.env.EMAIL_SEND_WINDOW_END_HOUR_UTC || "23",
  10
);

export function computeRandomDaytimeSendTime(from: Date = new Date()): Date {
  const dayOffset =
    MIN_DAY_OFFSET +
    Math.floor(Math.random() * (MAX_DAY_OFFSET - MIN_DAY_OFFSET + 1));
  const hour =
    WINDOW_START_HOUR_UTC +
    Math.floor(Math.random() * (WINDOW_END_HOUR_UTC - WINDOW_START_HOUR_UTC));
  const minute = Math.floor(Math.random() * 60);

  const candidate = new Date(from);
  candidate.setUTCDate(candidate.getUTCDate() + dayOffset);
  candidate.setUTCHours(hour, minute, 0, 0);

  if (candidate <= from) {
    candidate.setUTCDate(candidate.getUTCDate() + 1);
  }

  return candidate;
}
