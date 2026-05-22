export type UserRole = "contributor" | "maintainer";

export type IssueType = "bug" | "feature_request";

export type IssueStatus = "open" | "in_progress" | "resolved";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface JwtPayload {
  id: number;
  name: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
