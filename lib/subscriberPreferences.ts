// Shared source of truth for the optional signup-form preference fields.
// Used by both the client form and the server-side validation route.

export const STUDY_GROUP_PREFERENCES = {
  IN_PERSON: "In person",
  ONLINE: "Online",
  NO: "No",
} as const;

export type StudyGroupPreferenceKey = keyof typeof STUDY_GROUP_PREFERENCES;

export const STUDY_GROUP_PREFERENCE_KEYS = Object.keys(
  STUDY_GROUP_PREFERENCES
) as StudyGroupPreferenceKey[];

export function isStudyGroupPreference(
  value: unknown
): value is StudyGroupPreferenceKey {
  return (
    typeof value === "string" &&
    (STUDY_GROUP_PREFERENCE_KEYS as string[]).includes(value)
  );
}

export const EMAIL_PREFERENCES = {
  VERSES: "Verses to my inbox",
  DIRECT_OUTREACH: "Direct outreach from the team",
  NOTHING: "Nothing",
} as const;

export type EmailPreferenceKey = keyof typeof EMAIL_PREFERENCES;

export const EMAIL_PREFERENCE_KEYS = Object.keys(
  EMAIL_PREFERENCES
) as EmailPreferenceKey[];

export function isEmailPreference(
  value: unknown
): value is EmailPreferenceKey {
  return (
    typeof value === "string" &&
    (EMAIL_PREFERENCE_KEYS as string[]).includes(value)
  );
}
