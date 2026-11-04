import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { getLocalDataDir } from '../auth-mode';

/**
 * Minimal credential store for `AUTH_MODE=local`: a JSON file with scrypt
 * password hashes. Deliberately kept outside the Prisma schema so the offline
 * shim leaves no trace in the production database or migration history.
 */
export type LocalAuthUser = {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  updatedAt: string;
};

type StoreFile = { users: LocalAuthUser[] };

const KEY_LENGTH = 64;

export function getLocalAuthStorePath(): string {
  return join(getLocalDataDir(), 'auth-users.json');
}

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, KEY_LENGTH).toString('hex');
}

function readStore(): StoreFile {
  const path = getLocalAuthStorePath();
  if (!existsSync(path)) return { users: [] };

  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as Partial<StoreFile>;
    return { users: Array.isArray(parsed.users) ? parsed.users : [] };
  } catch {
    return { users: [] };
  }
}

function writeStore(store: StoreFile): void {
  const path = getLocalAuthStorePath();
  mkdirSync(dirname(path), { recursive: true });
  // Write-then-rename so a crash mid-write cannot corrupt the store.
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(store, null, 2));
  renameSync(tmp, path);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function findLocalAuthUserByEmail(email: string): LocalAuthUser | null {
  const normalized = normalizeEmail(email);
  return readStore().users.find((user) => user.email === normalized) ?? null;
}

export function findLocalAuthUserById(id: string): LocalAuthUser | null {
  return readStore().users.find((user) => user.id === id) ?? null;
}

/** Returns `null` when the email is already taken. */
export function createLocalAuthUser(
  email: string,
  password: string,
): LocalAuthUser | null {
  const store = readStore();
  const normalized = normalizeEmail(email);

  if (store.users.some((user) => user.email === normalized)) {
    return null;
  }

  const salt = randomBytes(16).toString('hex');
  const now = new Date().toISOString();
  const user: LocalAuthUser = {
    id: randomUUID(),
    email: normalized,
    passwordHash: hashPassword(password, salt),
    salt,
    createdAt: now,
    updatedAt: now,
  };

  store.users.push(user);
  writeStore(store);
  return user;
}

export function deleteLocalAuthUser(id: string): void {
  const store = readStore();
  const next = store.users.filter((user) => user.id !== id);
  if (next.length !== store.users.length) {
    writeStore({ users: next });
  }
}

/** Returns `false` when the user does not exist or the new email is taken. */
export function updateLocalAuthUser(
  id: string,
  input: { email?: string; password?: string },
): { ok: true } | { ok: false; reason: 'NOT_FOUND' | 'DUPLICATE_EMAIL' } {
  const store = readStore();
  const user = store.users.find((entry) => entry.id === id);
  if (!user) return { ok: false, reason: 'NOT_FOUND' };

  if (input.email) {
    const normalized = normalizeEmail(input.email);
    if (
      store.users.some((entry) => entry.id !== id && entry.email === normalized)
    ) {
      return { ok: false, reason: 'DUPLICATE_EMAIL' };
    }
    user.email = normalized;
  }

  if (input.password) {
    user.salt = randomBytes(16).toString('hex');
    user.passwordHash = hashPassword(input.password, user.salt);
  }

  user.updatedAt = new Date().toISOString();
  writeStore(store);
  return { ok: true };
}

export function verifyLocalAuthPassword(
  user: LocalAuthUser,
  password: string,
): boolean {
  const expected = Buffer.from(user.passwordHash, 'hex');
  const actual = Buffer.from(hashPassword(password, user.salt), 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
