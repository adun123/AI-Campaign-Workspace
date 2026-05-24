import type { ID, ISODateString } from "./common";

export type UserRole = "owner" | "admin" | "editor" | "viewer";

export interface User {
  id: ID;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: ISODateString;
}

export interface Workspace {
  id: ID;
  name: string;
  slug: string;
  plan: "free" | "team" | "agency" | "enterprise";
  ownerId: ID;
  memberIds: ID[];
  createdAt: ISODateString;
}
