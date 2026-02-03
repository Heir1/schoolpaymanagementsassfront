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

// Statistiques utilisateurs - GET /api/v1/admin/users/statistics
export interface AdminUsersStatisticsResponse {
  status: string;
  data: {
    total_users: number;
    active_users: number;
    deleted_users: number;
    new_users_today?: number;
    new_users_this_week?: number;
    new_users_this_month?: number;
    email_verified_users?: number;
    users_without_avatar?: number;
    active_percentage?: number;
    verified_percentage?: number;
    with_avatar_percentage?: number;
    users_by_role?: Record<
      string,
      { id: number; name: string; description?: string; total: number; active: number; deleted: number }
    >;
    users_by_school?: Record<
      string,
      { id: number; name: string; total: number; active: number; deleted: number }
    >;
    top_schools_by_user_count?: { id: number; name: string; user_count: number }[];
    metrics?: {
      avg_users_per_role?: number;
      avg_users_per_school?: number;
      growth_rate_this_week?: number;
    };
  };
  message: string;
}

// Admin API - Écoles

export interface AdminSchoolType {
  id: number;
  name: string;
}

export interface AdminSchoolUserRef {
  id: string;
  name: string;
}

export interface AdminSchoolListItem {
  id: number;
  name: string;
  type: AdminSchoolType;
  address: string | null;
  phone: string | null;
  school_years_count: number;
  logo_url?: string | null;
  created_by: AdminSchoolUserRef | null;
  updated_by: AdminSchoolUserRef | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AdminSchoolsListResponse {
  status: string;
  data: PaginatedMeta & { data: AdminSchoolListItem[] };
  message: string;
}

// Statistiques écoles
export interface AdminSchoolsStatisticsResponse {
  status: string;
  data: {
    total_schools: number;
    active_schools: number;
    deleted_schools: number;
    schools_by_type: { type_name: string; count: number }[];
    recent_schools_last_30_days: number;
  };
  message: string;
}

// Types d'écoles (pour formulaires)
export interface AdminSchoolTypeItem {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  deleted_at: string | null;
}

export interface AdminSchoolTypesResponse {
  status: string;
  data: AdminSchoolTypeItem[];
  message: string;
}

// Détail d'une école
export interface AdminSchoolDetail {
  id: number;
  name: string;
  type: AdminSchoolType;
  address: string | null;
  phone: string | null;
  logo_url?: string | null;
  created_by: AdminSchoolUserRef | null;
  updated_by: AdminSchoolUserRef | null;
  school_years: unknown[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AdminSchoolDetailResponse {
  status: string;
  data: AdminSchoolDetail;
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

// Profil utilisateur connecté - changement de mot de passe
export interface ChangePasswordRequestBody {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface ChangePasswordResponse {
  status: string;
  message: string;
  data?: {
    user_id: string;
    full_name: string;
    password_changed_at: string;
    logout_other_devices: boolean;
  };
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

// Admin API - Années scolaires (school_admin / superadmin)
export interface AdminSchoolYearSchoolRef {
  id: number;
  name: string;
}

export interface AdminSchoolYearUserRef {
  id: string;
  name: string;
}

export interface AdminSchoolYearListItem {
  id: number;
  year_label: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  school: AdminSchoolYearSchoolRef;
  created_by: AdminSchoolYearUserRef | null;
  updated_by: AdminSchoolYearUserRef | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AdminSchoolYearsListResponse {
  status: string;
  data: PaginatedMeta & { data: AdminSchoolYearListItem[] };
  message: string;
}

export interface CreateSchoolYearRequestBody {
  school_id: number;
  year_label: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface UpdateSchoolYearRequestBody {
  year_label?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

export interface AdminSchoolYearDetailResponse {
  status: string;
  data: AdminSchoolYearListItem;
  message: string;
}

// Admin API - Groupes d'étudiants (student-groups) - school_admin
export interface AdminStudentGroupStatisticsResponse {
  status: string;
  data: {
    total_groups: number;
    active_groups: number;
    deleted_groups: number;
    groups_by_school: { school_name: string; count: number }[];
    recent_groups_last_30_days: number;
  };
  message: string;
}

export interface AdminStudentGroupSchoolRef {
  id: number;
  name: string;
}

export interface AdminStudentGroupListItem {
  id: number;
  name: string;
  description: string | null;
  school: AdminStudentGroupSchoolRef;
  group_fees_count: number;
  created_by: AdminSchoolYearUserRef | null;
  updated_by: AdminSchoolYearUserRef | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AdminStudentGroupsListResponse {
  status: string;
  data: PaginatedMeta & { data: AdminStudentGroupListItem[] };
  message: string;
}

export interface CreateStudentGroupRequestBody {
  school_id: number;
  name: string;
  description?: string;
}

export interface UpdateStudentGroupRequestBody {
  name?: string;
  description?: string;
}

export interface AdminStudentGroupDetailResponse {
  status: string;
  data: AdminStudentGroupListItem;
  message: string;
}

// Admin API - Classes (school_admin / superadmin)
export interface AdminClassesStatisticsResponse {
  status: string;
  data: {
    total_classes: number;
    active_classes: number;
    deleted_classes: number;
    classes_by_school?: { school_name: string; count: number }[];
    recent_classes_last_30_days?: number;
  };
  message: string;
}

export interface AdminClassSchoolRef {
  id: number;
  name: string;
}

export interface AdminClassSchoolYearRef {
  id: number;
  year_label: string;
  school_id?: number;
}

export interface AdminClassListItem {
  id: number;
  name: string;
  level: string | null;
  school: AdminClassSchoolRef;
  school_year: AdminClassSchoolYearRef;
  created_by: AdminSchoolYearUserRef | null;
  updated_by: AdminSchoolYearUserRef | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AdminClassesListResponse {
  status: string;
  data: PaginatedMeta & { data: AdminClassListItem[] };
  message: string;
}

// Options pour formulaires : super_admin (schools + school_years) ou school_admin (school + school_years + default_school_year)
export interface AdminClassesOptionsSchoolItem {
  id: number;
  name: string;
}

export interface AdminClassesOptionsSchoolYearItem {
  id: number;
  year_label: string;
  school_id?: number;
}

export interface AdminClassesOptionsSuperAdmin {
  schools: AdminClassesOptionsSchoolItem[];
  school_years: AdminClassesOptionsSchoolYearItem[];
}

export interface AdminClassesOptionsSchoolAdmin {
  school: AdminClassesOptionsSchoolItem;
  school_years: AdminClassesOptionsSchoolYearItem[];
  default_school_year: AdminClassesOptionsSchoolYearItem;
}

export type AdminClassesOptionsData =
  | AdminClassesOptionsSuperAdmin
  | AdminClassesOptionsSchoolAdmin;

export interface AdminClassesOptionsResponse {
  status: string;
  data: AdminClassesOptionsData;
  message: string;
}

export function isClassesOptionsSchoolAdmin(
  data: AdminClassesOptionsData
): data is AdminClassesOptionsSchoolAdmin {
  return "school" in data && !("schools" in data);
}

export interface CreateClassRequestBody {
  school_id: number;
  school_year_id: number;
  name: string;
  level: string;
}

export interface UpdateClassRequestBody {
  school_year_id?: number;
  name?: string;
  level?: string;
}

export interface AdminClassDetailResponse {
  status: string;
  data: AdminClassListItem;
  message: string;
}

// Admin API - Types de frais (fee-types) - school_admin / superadmin
export interface AdminFeeTypeSchoolRef {
  id: number;
  name: string;
}

export interface AdminFeeTypeListItem {
  id: number;
  name: string;
  description: string | null;
  payable_by: string;
  school?: AdminFeeTypeSchoolRef;
  school_id?: number;
  created_by: string | { id: string; full_name: string };
  updated_by: string | { id: string; full_name: string };
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface FeeTypePagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

export interface AdminFeeTypesListResponse {
  status: string;
  data: {
    fee_types: AdminFeeTypeListItem[];
    pagination: FeeTypePagination;
  };
  message: string;
}

export interface AdminFeeTypeDetailResponse {
  status: string;
  data: AdminFeeTypeListItem;
  message: string;
}

/** school_admin: pas de school_id (backend l'infère). super_admin: school_id requis. payable_by = "parent" par défaut (caché en UI). */
export interface CreateFeeTypeRequestBody {
  school_id?: number;
  name: string;
  description?: string;
  payable_by?: string;
}

export interface UpdateFeeTypeRequestBody {
  name?: string;
  description?: string;
}

// Admin API - Frais (fees) - section 5
export interface AdminFeeTypeRef {
  id: number;
  name: string;
  payable_by?: string;
  school?: { id: number; name: string };
}

export interface AdminFeeInstallmentItem {
  id?: number;
  installment_no?: number;
  amount: number;
  due_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminFeeListItem {
  id: number;
  amount: number;
  due_date: string;
  fee_type: AdminFeeTypeRef;
  installments: AdminFeeInstallmentItem[];
  associated_classes_count?: number;
  associated_classes?: { id: number; name: string }[];
  created_by: string | { id: string; full_name: string };
  updated_by: string | { id: string; full_name: string };
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface AdminFeesListResponse {
  status: string;
  data: {
    fees: AdminFeeListItem[];
    pagination: FeeTypePagination;
  };
  message: string;
}

export interface AdminFeesStatisticsResponse {
  status: string;
  data: {
    general: {
      total_fees: number;
      total_amount: number;
      average_amount: number;
      fees_with_installments: number;
      fees_without_installments: number;
      percentage_with_installments: number;
      average_installments_per_fee: number;
    };
    by_type: { type: string; count: number; total_amount: number; average_amount: number }[];
    by_month: unknown[];
  };
  message: string;
}

export interface AdminFeeInstallmentsResponse {
  status: string;
  data: {
    fee: { id: number; amount: number; due_date: string };
    installments: AdminFeeInstallmentItem[];
    total_amount: number;
    installments_count: number;
  };
  message: string;
}

export interface AdminFeeDetailResponse {
  status: string;
  data: AdminFeeListItem;
  message: string;
}

export interface CreateFeeInstallmentItem {
  amount: number;
  due_date: string;
}

export interface CreateFeeRequestBody {
  fee_type_id: number;
  amount: number;
  due_date: string;
  installments?: CreateFeeInstallmentItem[];
  class_ids?: number[];
}

export interface UpdateFeeRequestBody {
  fee_type_id?: number;
  amount?: number;
  due_date?: string;
  installments?: CreateFeeInstallmentItem[];
  class_ids?: number[];
}

export interface AssociateFeeClassesRequestBody {
  class_ids: number[];
}
