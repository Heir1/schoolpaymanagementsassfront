export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface User {
  id: string;
  full_name: string;
  phone_or_email: string;
  avatar_url: string | null;
  is_email: boolean;
  is_phone: boolean;
  created_at: string;
  role: Role;
  permissions?: string[];
}

export interface LoginRequestBody {
  phone_or_email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  user: User;
  message: string;
  token: string;
  token_type: string;
  expires_in: number | null;
}

export interface MeResponse {
  status: string;
  user: User;
  message: string;
}

export interface RegisterParentRequestBody {
  full_name: string;
  phone_or_email: string;
  password: string;
  password_confirmation: string;
}

export interface LogoutResponse {
  status: string;
  message: string;
}

export type RoleName = "superadmin" | "school_admin" | "parent";

// Admin API - Liste utilisateurs
export interface AdminUserRoleItem {
  id: number;
  role_id: number;
  role_name: string;
  school_id: number | null;
  school_name: string | null;
}

export interface AdminUserListItem {
  id: string;
  full_name: string;
  phone_or_email: string;
  avatar_url: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
  roles: AdminUserRoleItem[];
  is_parent: boolean;
}

export interface PaginatedMeta {
  current_page: number;
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: { url: string | null; label: string; page: number | null; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface AdminUsersListResponse {
  status: string;
  data: PaginatedMeta & { data: AdminUserListItem[] };
  message: string;
}

// Admin API - Liste écoles
export interface AdminSchoolType {
  id: number;
  name: string;
}

export interface AdminSchoolListItem {
  id: number;
  name: string;
  type: AdminSchoolType;
  address: string | null;
  phone: string | null;
  school_years_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AdminSchoolsListResponse {
  status: string;
  data: PaginatedMeta & { data: AdminSchoolListItem[] };
  message: string;
}

// Admin API - Profil utilisateur (détail)
export interface AdminUserProfileRoleSchool {
  id: number;
  name: string;
  type: string;
}

export interface AdminUserProfileRole {
  id: number;
  role: { id: number; name: string; description: string };
  school: AdminUserProfileRoleSchool;
  created_by: string;
  created_at: string;
}

export interface AdminUserProfile {
  id: string;
  full_name: string;
  phone_or_email: string;
  avatar_url: string | null;
  email_verified_at: string | null;
  initial_password_set: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_deleted?: boolean;
  roles: AdminUserProfileRole[];
  parent_profile: unknown | null;
}

export interface AdminUserProfileResponse {
  status: string;
  data: AdminUserProfile;
  message: string;
}

// Admin API - Reset password response
export interface AdminResetPasswordResponse {
  status: string;
  message: string;
  data: {
    user: { id: string; full_name: string };
    new_password: string;
    instructions: string;
    security_note: string;
  };
}
