// lib/user-management.ts - Simple user system with proper family hierarchy
export interface User {
  id: string;
  name: string;
  password: string;
  role: "admin" | "user";
  emoji: string;
  createdAt: Date;
}

// Family hierarchy: Parents are admin, child is user
export const users: User[] = [
  {
    id: "dad",
    name: "Dad",
    password: process.env.ADMIN_PASSWORD || "S@v3sl0t1",
    role: "admin",
    emoji: "👦🏽",
    createdAt: new Date(),
  },
  {
    id: "mom",
    name: "Mom",
    password: process.env.MOM_PASSWORD || "jharasen",
    role: "admin",
    emoji: "👩",
    createdAt: new Date(),
  },
  {
    id: "paitin",
    name: "Paitin",
    password: process.env.APP_PASSWORD || "winterbottom",
    role: "user",
    emoji: "👧",
    createdAt: new Date(),
  },
];

export function findUserByPassword(password: string): User | null {
  return users.find((user) => user.password === password) || null;
}

export function isAdmin(password: string): boolean {
  const user = findUserByPassword(password);
  return user?.role === "admin";
}

export function getCurrentUser(password: string): User | null {
  return findUserByPassword(password);
}
