export type OfferStatus = "DRAFT" | "PUBLISHED" | "EXPIRED" | "PAUSED";
export type UserRole = "ADMIN" | "EDITOR" | "VISITOR";
export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
};
