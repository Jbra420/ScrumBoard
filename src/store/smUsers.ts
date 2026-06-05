// ============================================================
// ScrumBoard Pro — Scrum Master User Management Store
// ============================================================
// DJBRA is the immutable super-admin. Additional SM accounts
// are created by DJBRA and stored in localStorage.
// ============================================================

import type { ScrumMasterUser } from '../types/index';

const SM_USERS_KEY = 'scrumboard_sm_users';

// Pre-seeded default users (created at startup if not already present)
const DEFAULT_USERS: ScrumMasterUser[] = [
  {
    id: 'pablo-sm-001',
    username: 'PABLO',
    password: 'Master024',
    displayName: 'Pablo Ortega',
    avatarColor: '#38BDF8',
    isSuperAdmin: false,
    createdAt: '2026-01-01',
  },
];

/** Ensure default SM users exist in localStorage (called at app startup) */
export function seedDefaultSmUsers(): void {
  const existing = loadFromStorage();
  let changed = false;
  DEFAULT_USERS.forEach(def => {
    if (!existing.find(u => u.id === def.id)) {
      existing.push(def);
      changed = true;
    }
  });
  if (changed) saveToStorage(existing);
}


const SUPER_ADMIN: ScrumMasterUser = {
  id: 'djbra-superadmin',
  username: 'DJBRA',
  password: 'Master420',
  displayName: 'DJBRA',
  avatarColor: '#A855F7',
  isSuperAdmin: true,
  createdAt: '2026-01-01',
};

/** Load all SM users from localStorage (excludes superAdmin, merged on read) */
function loadFromStorage(): ScrumMasterUser[] {
  try {
    const raw = localStorage.getItem(SM_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Persist additional SM users (excludes superAdmin) */
function saveToStorage(users: ScrumMasterUser[]): void {
  const withoutSuper = users.filter(u => !u.isSuperAdmin);
  localStorage.setItem(SM_USERS_KEY, JSON.stringify(withoutSuper));
}

export const smUsersStore = {
  /** Returns all SM users: superAdmin first, then created SMs */
  getAll(): ScrumMasterUser[] {
    return [SUPER_ADMIN, ...loadFromStorage()];
  },

  /** Returns only the extra SM accounts (not the superAdmin) */
  getCreated(): ScrumMasterUser[] {
    return loadFromStorage();
  },

  /** Validate credentials. Returns the matching user or null */
  validate(username: string, password: string): ScrumMasterUser | null {
    const all = smUsersStore.getAll();
    return all.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    ) || null;
  },

  /** Check if a username is already taken */
  usernameTaken(username: string): boolean {
    return smUsersStore.getAll().some(
      u => u.username.toLowerCase() === username.toLowerCase()
    );
  },

  /** Add a new SM user. Returns error string or null on success */
  add(user: Omit<ScrumMasterUser, 'id' | 'isSuperAdmin' | 'createdAt'>): string | null {
    if (!user.username.trim()) return 'El usuario es requerido';
    if (!user.password.trim() || user.password.length < 4) return 'La contraseña debe tener mínimo 4 caracteres';
    if (!user.displayName.trim()) return 'El nombre es requerido';
    if (smUsersStore.usernameTaken(user.username)) return `El usuario "${user.username}" ya existe`;

    const newUser: ScrumMasterUser = {
      id: 'sm-' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36),
      username: user.username.trim().toUpperCase(),
      password: user.password,
      displayName: user.displayName.trim(),
      avatarColor: user.avatarColor || '#6366F1',
      isSuperAdmin: false,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const current = loadFromStorage();
    current.push(newUser);
    saveToStorage(current);
    return null;
  },

  /** Delete a SM user by id. Cannot delete superAdmin */
  delete(id: string): boolean {
    if (id === SUPER_ADMIN.id) return false;
    const current = loadFromStorage();
    const filtered = current.filter(u => u.id !== id);
    saveToStorage(filtered);
    return true;
  },

  /** Get user by username */
  getByUsername(username: string): ScrumMasterUser | undefined {
    return smUsersStore.getAll().find(u => u.username.toLowerCase() === username.toLowerCase());
  },
};
