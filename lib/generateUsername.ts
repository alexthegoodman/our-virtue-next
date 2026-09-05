import { prisma } from '@/lib/db';

// Derives a unique username from an email's local part, for accounts that
// are auto-created (not chosen by the user at signup time).
export async function generateUniqueUsername(email: string): Promise<string> {
  const base =
    email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 20) || 'member';

  let candidate = base;
  let attempt = 0;

  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    attempt += 1;
    if (attempt > 10) {
      candidate = `${base}_${Date.now().toString(36)}`;
      break;
    }
    candidate = `${base}${Math.floor(1000 + Math.random() * 9000)}`;
  }

  return candidate;
}
