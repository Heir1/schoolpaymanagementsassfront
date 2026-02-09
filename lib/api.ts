import type {
  LoginRequestBody,
  LoginResponse,
  MeResponse,
  RegisterParentRequestBody,
  LogoutResponse,
  AdminUsersListResponse,
  AdminUsersStatisticsResponse,
  AdminSchoolsListResponse,
  AdminSchoolsStatisticsResponse,
  AdminSchoolTypesResponse,
  AdminSchoolDetailResponse,
  AdminUserProfileResponse,
  AdminResetPasswordResponse,
  ChangePasswordRequestBody,
  ChangePasswordResponse,
  AdminSchoolYearsListResponse,
  AdminSchoolYearDetailResponse,
  CreateSchoolYearRequestBody,
  UpdateSchoolYearRequestBody,
  AdminStudentGroupStatisticsResponse,
  AdminStudentGroupsListResponse,
  AdminStudentGroupDetailResponse,
  CreateStudentGroupRequestBody,
  UpdateStudentGroupRequestBody,
  AdminClassesStatisticsResponse,
  AdminClassesListResponse,
  AdminClassesOptionsResponse,
  AdminClassDetailResponse,
  CreateClassRequestBody,
  UpdateClassRequestBody,
  AdminClassRequiredDocumentsResponse,
  AddClassRequiredDocumentRequestBody,
  ClassRequiredDocumentsBulkRequestBody,
  AdminFeeTypesListResponse,
  AdminFeeTypeDetailResponse,
  CreateFeeTypeRequestBody,
  UpdateFeeTypeRequestBody,
  AdminFeesListResponse,
  AdminFeesStatisticsResponse,
  AdminFeeInstallmentsResponse,
  AdminFeeDetailResponse,
  CreateFeeRequestBody,
  UpdateFeeRequestBody,
  AssociateFeeClassesRequestBody,
  AdminProvincesResponse,
  AdminProvinceCitiesResponse,
  AdminStudentCodeResponse,
  AdminStudentsListResponse,
  AdminStudentDetailResponse,
  AdminClassStudentsResponse,
  CreateStudentRequestBody,
  UpdateStudentRequestBody,
  AdminStudentFeesListResponse,
  AdminStudentFeeDetailResponse,
  CreateStudentFeeRequestBody,
  UpdateStudentFeeRequestBody,
  AdminStudentGroupFeesListResponse,
  AdminStudentGroupFeeDetailResponse,
  CreateStudentGroupFeeRequestBody,
  UpdateStudentGroupFeeRequestBody,
  AdminInscriptionDocumentsStatisticsResponse,
  AdminInscriptionDocumentsListResponse,
  AdminInscriptionDocumentDetailResponse,
  CreateInscriptionDocumentRequestBody,
  UpdateInscriptionDocumentRequestBody,
  ParentSchoolsSearchResponse,
  ParentSchoolClassesResponse,
  ParentClassStudentsResponse,
  ParentChildCheckResponse,
  ParentLinkChildResponse,
  ParentUnlinkChildResponse,
  ParentChildrenResponse,
  ParentStatisticsResponse,
} from "./types";

const TOKEN_KEY = "schoolpay_token";
const CSRF_COOKIE_NAME = "XSRF-TOKEN";

function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }
  return url.replace(/\/$/, "");
}

/** Réécrit l'URL d'avatar/logo (ex. http://localhost/storage/... ou /storage/...) avec l'origin de l'API pour que les images s'affichent. */
export function getAvatarUrl(avatarUrl: string | null): string | null {
  if (!avatarUrl) return null;
  try {
    const base = getApiUrl();
    if (avatarUrl.startsWith("/")) return base + avatarUrl;
    return avatarUrl.replace(/^https?:\/\/[^/]+/, base);
  } catch {
    return avatarUrl;
  }
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(";");
  for (const part of parts) {
    const [key, ...rest] = part.split("=");
    if (key?.trim() === name) {
      const value = rest.join("=").trim();
      return value ? decodeURIComponent(value) : null;
    }
  }
  return null;
}

/** Récupère le cookie CSRF (Laravel Sanctum) avant login/register/logout */
export async function fetchCsrfCookie(): Promise<void> {
  const url = `${getApiUrl()}/sanctum/csrf-cookie`;
  await fetch(url, { method: "GET", credentials: "include" });
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null; withCsrf?: boolean } = {}
): Promise<T> {
  const { token, withCsrf, ...init } = options;
  const url = `${getApiUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  if (withCsrf) {
    const xsrf = getCookie(CSRF_COOKIE_NAME);
    if (xsrf) {
      (headers as Record<string, string>)["X-XSRF-TOKEN"] = xsrf;
    }
  }
  const res = await fetch(url, {
    ...init,
    headers,
    credentials: withCsrf ? "include" : init.credentials,
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    let msg: string | undefined;
    if (typeof data?.message === "string") msg = data.message;
    else if (data?.errors && typeof data.errors === "object") {
      const err = data.errors as Record<string, unknown>;
      const first =
      err.phone_or_email ??
      err.email ??
      err.password ??
      err.current_password ??
      err.new_password ??
      Object.values(err)[0];
      msg = Array.isArray(first) ? (first[0] as string) : (first as string);
    }
    throw new Error(msg || res.statusText);
  }
  return data as T;
}

/** Requête avec FormData (pas de Content-Type pour laisser le navigateur ajouter multipart/form-data; boundary). */
async function requestFormData<T>(
  path: string,
  options: {
    method: string;
    body: FormData;
    token?: string | null;
    withCsrf?: boolean;
  }
): Promise<T> {
  const { token, withCsrf, body, method } = options;
  const url = `${getApiUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: HeadersInit = {
    Accept: "application/json",
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  if (withCsrf) {
    const xsrf = getCookie(CSRF_COOKIE_NAME);
    if (xsrf) {
      (headers as Record<string, string>)["X-XSRF-TOKEN"] = xsrf;
    }
  }
  const res = await fetch(url, {
    method,
    body,
    headers,
    credentials: withCsrf ? "include" : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    let msg: string | undefined;
    if (typeof data?.message === "string") msg = data.message;
    else if (data?.errors && typeof data.errors === "object") {
      const err = data.errors as Record<string, unknown>;
      const first =
        err.phone_or_email ??
        err.email ??
        err.full_name ??
        err.avatar ??
        err.name ??
        err.type_id ??
        err.logo ??
        err.logo_url ??
        Object.values(err)[0];
      msg = Array.isArray(first) ? (first[0] as string) : (first as string);
    }
    throw new Error(msg || res.statusText);
  }
  return data as T;
}

export const api = {
  async login(body: LoginRequestBody): Promise<LoginResponse> {
    await fetchCsrfCookie();
    return request<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
      withCsrf: true,
    });
  },

  async logout(token: string | null): Promise<LogoutResponse> {
    await fetchCsrfCookie();
    return request<LogoutResponse>("/api/v1/auth/logout", {
      method: "POST",
      token,
      withCsrf: true,
    });
  },

  me(token: string | null): Promise<MeResponse> {
    return request<MeResponse>("/api/v1/auth/me", {
      method: "GET",
      token,
    });
  },

  async registerParent(body: RegisterParentRequestBody): Promise<{ status: string; message?: string }> {
    await fetchCsrfCookie();
    return request("/api/v1/auth/register-parent", {
      method: "POST",
      body: JSON.stringify(body),
      withCsrf: true,
    });
  },

  admin: {
    getUsers(token: string | null, page = 1): Promise<AdminUsersListResponse> {
      return request<AdminUsersListResponse>(
        `/api/v1/admin/users?page=${page}`,
        { method: "GET", token }
      );
    },

    getUsersStatistics(
      token: string | null
    ): Promise<AdminUsersStatisticsResponse> {
      return request<AdminUsersStatisticsResponse>(
        "/api/v1/admin/users/statistics",
        { method: "GET", token }
      );
    },

    getSchools(token: string | null, page = 1): Promise<AdminSchoolsListResponse> {
      return request<AdminSchoolsListResponse>(
        `/api/v1/admin/schools?page=${page}`,
        { method: "GET", token }
      );
    },

    getSchoolsStatistics(
      token: string | null
    ): Promise<AdminSchoolsStatisticsResponse> {
      return request<AdminSchoolsStatisticsResponse>(
        "/api/v1/admin/schools/statistics",
        { method: "GET", token }
      );
    },

    getSchoolTypes(token: string | null): Promise<AdminSchoolTypesResponse> {
      return request<AdminSchoolTypesResponse>(
        "/api/v1/admin/school-types",
        { method: "GET", token }
      );
    },

    getSchool(
      token: string | null,
      id: string | number
    ): Promise<AdminSchoolDetailResponse> {
      return request<AdminSchoolDetailResponse>(
        `/api/v1/admin/schools/${id}`,
        { method: "GET", token }
      );
    },

    async createSchool(
      token: string | null,
      formData: FormData
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return requestFormData("/api/v1/admin/schools", {
        method: "POST",
        body: formData,
        token,
        withCsrf: true,
      });
    },

    async updateSchool(
      token: string | null,
      id: string | number,
      formData: FormData
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return requestFormData(`/api/v1/admin/schools/${id}`, {
        method: "PUT",
        body: formData,
        token,
        withCsrf: true,
      });
    },

    async deleteSchool(
      token: string | null,
      id: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/schools/${id}`, {
        method: "DELETE",
        token,
        withCsrf: true,
      });
    },

    async restoreSchool(
      token: string | null,
      id: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/schools/${id}/restore`, {
        method: "POST",
        body: JSON.stringify({}),
        token,
        withCsrf: true,
      });
    },

    /** Upload du logo d'une école - POST /api/v1/admin/schools/{id}/logo (FormData clé "logo") */
    async uploadSchoolLogo(
      token: string | null,
      schoolId: string | number,
      formData: FormData
    ): Promise<{ status: string; message?: string; data?: { logo_url?: string } }> {
      await fetchCsrfCookie();
      return requestFormData(`/api/v1/admin/schools/${schoolId}/logo`, {
        method: "POST",
        body: formData,
        token,
        withCsrf: true,
      });
    },

    /** Suppression du logo d'une école - DELETE /api/v1/admin/schools/{id}/logo */
    async deleteSchoolLogo(
      token: string | null,
      schoolId: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/schools/${schoolId}/logo`, {
        method: "DELETE",
        token,
        withCsrf: true,
      });
    },

    // Années scolaires (school_admin / superadmin)
    getSchoolYears(
      token: string | null,
      page = 1
    ): Promise<AdminSchoolYearsListResponse> {
      return request<AdminSchoolYearsListResponse>(
        `/api/v1/admin/school-years?page=${page}`,
        { method: "GET", token }
      );
    },

    getSchoolYear(
      token: string | null,
      id: string | number
    ): Promise<AdminSchoolYearDetailResponse> {
      return request<AdminSchoolYearDetailResponse>(
        `/api/v1/admin/school-years/${id}`,
        { method: "GET", token }
      );
    },

    async createSchoolYear(
      token: string | null,
      body: CreateSchoolYearRequestBody
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/school-years`, {
        method: "POST",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    async updateSchoolYear(
      token: string | null,
      id: string | number,
      body: UpdateSchoolYearRequestBody
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/school-years/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    async deleteSchoolYear(
      token: string | null,
      id: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/school-years/${id}`, {
        method: "DELETE",
        token,
        withCsrf: true,
      });
    },

    async restoreSchoolYear(
      token: string | null,
      id: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/school-years/${id}/restore`, {
        method: "POST",
        body: JSON.stringify({}),
        token,
        withCsrf: true,
      });
    },

    async toggleSchoolYearActive(
      token: string | null,
      id: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/school-years/${id}/toggle-active`, {
        method: "POST",
        body: JSON.stringify({}),
        token,
        withCsrf: true,
      });
    },

    // Groupes d'étudiants (student-groups) - school_admin
    getStudentGroupsStatistics(
      token: string | null
    ): Promise<AdminStudentGroupStatisticsResponse> {
      return request<AdminStudentGroupStatisticsResponse>(
        "/api/v1/admin/student-groups/statistics",
        { method: "GET", token }
      );
    },

    getStudentGroups(
      token: string | null,
      page = 1
    ): Promise<AdminStudentGroupsListResponse> {
      return request<AdminStudentGroupsListResponse>(
        `/api/v1/admin/student-groups?page=${page}`,
        { method: "GET", token }
      );
    },

    getStudentGroup(
      token: string | null,
      id: string | number
    ): Promise<AdminStudentGroupDetailResponse> {
      return request<AdminStudentGroupDetailResponse>(
        `/api/v1/admin/student-groups/${id}`,
        { method: "GET", token }
      );
    },

    async createStudentGroup(
      token: string | null,
      body: CreateStudentGroupRequestBody
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return request("/api/v1/admin/student-groups", {
        method: "POST",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    async updateStudentGroup(
      token: string | null,
      id: string | number,
      body: UpdateStudentGroupRequestBody
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/student-groups/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    async deleteStudentGroup(
      token: string | null,
      id: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/student-groups/${id}`, {
        method: "DELETE",
        token,
        withCsrf: true,
      });
    },

    async restoreStudentGroup(
      token: string | null,
      id: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/student-groups/${id}/restore`, {
        method: "POST",
        body: JSON.stringify({}),
        token,
        withCsrf: true,
      });
    },

    // Classes (school_admin / superadmin)
    getClassesStatistics(
      token: string | null
    ): Promise<AdminClassesStatisticsResponse> {
      return request<AdminClassesStatisticsResponse>(
        "/api/v1/admin/classes/statistics",
        { method: "GET", token }
      );
    },

    getClasses(
      token: string | null,
      page = 1
    ): Promise<AdminClassesListResponse> {
      return request<AdminClassesListResponse>(
        `/api/v1/admin/classes?page=${page}`,
        { method: "GET", token }
      );
    },

    getClassesOptions(
      token: string | null
    ): Promise<AdminClassesOptionsResponse> {
      return request<AdminClassesOptionsResponse>(
        "/api/v1/admin/classes/options",
        { method: "GET", token }
      );
    },

    getClass(
      token: string | null,
      id: string | number
    ): Promise<AdminClassDetailResponse> {
      return request<AdminClassDetailResponse>(
        `/api/v1/admin/classes/${id}`,
        { method: "GET", token }
      );
    },

    async createClass(
      token: string | null,
      body: CreateClassRequestBody
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return request("/api/v1/admin/classes", {
        method: "POST",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    async updateClass(
      token: string | null,
      id: string | number,
      body: UpdateClassRequestBody
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/classes/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    async deleteClass(
      token: string | null,
      id: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/classes/${id}`, {
        method: "DELETE",
        token,
        withCsrf: true,
      });
    },

    async restoreClass(
      token: string | null,
      id: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/classes/${id}/restore`, {
        method: "POST",
        body: JSON.stringify({}),
        token,
        withCsrf: true,
      });
    },

    getClassRequiredDocuments(
      token: string | null,
      classId: string | number
    ): Promise<AdminClassRequiredDocumentsResponse> {
      return request<AdminClassRequiredDocumentsResponse>(
        `/api/v1/admin/classes/${classId}/required-documents`,
        { method: "GET", token }
      );
    },

    getClassAvailableDocuments(
      token: string | null,
      classId: string | number
    ): Promise<AdminClassRequiredDocumentsResponse> {
      return request<AdminClassRequiredDocumentsResponse>(
        `/api/v1/admin/classes/${classId}/required-documents/available-documents`,
        { method: "GET", token }
      );
    },

    async addClassRequiredDocument(
      token: string | null,
      classId: string | number,
      body: AddClassRequiredDocumentRequestBody
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/classes/${classId}/required-documents`, {
        method: "POST",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    async addClassRequiredDocumentsBulk(
      token: string | null,
      classId: string | number,
      body: ClassRequiredDocumentsBulkRequestBody
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/classes/${classId}/required-documents/bulk`, {
        method: "POST",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    async updateClassRequiredDocumentsBulk(
      token: string | null,
      classId: string | number,
      body: ClassRequiredDocumentsBulkRequestBody
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/classes/${classId}/required-documents/bulk`, {
        method: "PUT",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    async deleteClassRequiredDocument(
      token: string | null,
      classId: string | number,
      requiredDocId: number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(
        `/api/v1/admin/classes/${classId}/required-documents/${requiredDocId}`,
        { method: "DELETE", token, withCsrf: true }
      );
    },

    async restoreClassRequiredDocument(
      token: string | null,
      classId: string | number,
      requiredDocId: number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(
        `/api/v1/admin/classes/${classId}/required-documents/${requiredDocId}/restore`,
        { method: "POST", body: JSON.stringify({}), token, withCsrf: true }
      );
    },

    // Types de frais (fee-types) - school_admin / superadmin
    getFeeTypes(
      token: string | null,
      page = 1
    ): Promise<AdminFeeTypesListResponse> {
      return request<AdminFeeTypesListResponse>(
        `/api/v1/admin/fee-types?page=${page}`,
        { method: "GET", token }
      );
    },

    getFeeType(
      token: string | null,
      id: string | number
    ): Promise<AdminFeeTypeDetailResponse> {
      return request<AdminFeeTypeDetailResponse>(
        `/api/v1/admin/fee-types/${id}`,
        { method: "GET", token }
      );
    },

    async createFeeType(
      token: string | null,
      body: CreateFeeTypeRequestBody
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return request("/api/v1/admin/fee-types", {
        method: "POST",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    async updateFeeType(
      token: string | null,
      id: string | number,
      body: UpdateFeeTypeRequestBody
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/fee-types/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    async deleteFeeType(
      token: string | null,
      id: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/fee-types/${id}`, {
        method: "DELETE",
        token,
        withCsrf: true,
      });
    },

    async restoreFeeType(
      token: string | null,
      id: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/fee-types/${id}/restore`, {
        method: "POST",
        body: JSON.stringify({}),
        token,
        withCsrf: true,
      });
    },

    // Documents d'inscription (super_admin)
    getInscriptionDocumentsStatistics(
      token: string | null
    ): Promise<AdminInscriptionDocumentsStatisticsResponse> {
      return request<AdminInscriptionDocumentsStatisticsResponse>(
        "/api/v1/admin/inscription-documents/statistics",
        { method: "GET", token }
      );
    },

    getInscriptionDocuments(
      token: string | null,
      page = 1,
      params?: { status?: string; search?: string; sort_by?: string; sort_dir?: string; per_page?: number }
    ): Promise<AdminInscriptionDocumentsListResponse> {
      const sp = new URLSearchParams();
      sp.set("page", String(page));
      if (params?.status) sp.set("status", params.status);
      if (params?.search) sp.set("search", params.search);
      if (params?.sort_by) sp.set("sort_by", params.sort_by);
      if (params?.sort_dir) sp.set("sort_dir", params.sort_dir);
      if (params?.per_page) sp.set("per_page", String(params.per_page));
      return request<AdminInscriptionDocumentsListResponse>(
        `/api/v1/admin/inscription-documents?${sp.toString()}`,
        { method: "GET", token }
      );
    },

    getInscriptionDocument(
      token: string | null,
      id: string | number
    ): Promise<AdminInscriptionDocumentDetailResponse> {
      return request<AdminInscriptionDocumentDetailResponse>(
        `/api/v1/admin/inscription-documents/${id}`,
        { method: "GET", token }
      );
    },

    async createInscriptionDocument(
      token: string | null,
      body: CreateInscriptionDocumentRequestBody
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return request("/api/v1/admin/inscription-documents", {
        method: "POST",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    async updateInscriptionDocument(
      token: string | null,
      id: string | number,
      body: UpdateInscriptionDocumentRequestBody
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/inscription-documents/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    async deleteInscriptionDocument(
      token: string | null,
      id: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/inscription-documents/${id}`, {
        method: "DELETE",
        token,
        withCsrf: true,
      });
    },

    async restoreInscriptionDocument(
      token: string | null,
      id: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/inscription-documents/${id}/restore`, {
        method: "POST",
        body: JSON.stringify({}),
        token,
        withCsrf: true,
      });
    },

    // Frais (fees) - section 5
    getFees(token: string | null, page = 1): Promise<AdminFeesListResponse> {
      return request<AdminFeesListResponse>(`/api/v1/admin/fees?page=${page}`, {
        method: "GET",
        token,
      });
    },

    getFeesStatistics(
      token: string | null
    ): Promise<AdminFeesStatisticsResponse> {
      return request<AdminFeesStatisticsResponse>(
        "/api/v1/admin/fees/statistics",
        { method: "GET", token }
      );
    },

    getFee(
      token: string | null,
      id: string | number
    ): Promise<AdminFeeDetailResponse> {
      return request<AdminFeeDetailResponse>(`/api/v1/admin/fees/${id}`, {
        method: "GET",
        token,
      });
    },

    getFeeInstallments(
      token: string | null,
      id: string | number
    ): Promise<AdminFeeInstallmentsResponse> {
      return request<AdminFeeInstallmentsResponse>(
        `/api/v1/admin/fees/${id}/installments`,
        { method: "GET", token }
      );
    },

    async createFee(
      token: string | null,
      body: CreateFeeRequestBody
    ): Promise<{ status: string; message?: string; data?: { fee?: { id: number } } }> {
      await fetchCsrfCookie();
      return request("/api/v1/admin/fees", {
        method: "POST",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    async updateFee(
      token: string | null,
      id: string | number,
      body: UpdateFeeRequestBody
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/fees/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    async deleteFee(
      token: string | null,
      id: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/fees/${id}`, {
        method: "DELETE",
        token,
        withCsrf: true,
      });
    },

    async restoreFee(
      token: string | null,
      id: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/fees/${id}/restore`, {
        method: "POST",
        token,
        withCsrf: true,
      });
    },

    async associateFeeClasses(
      token: string | null,
      feeId: string | number,
      body: AssociateFeeClassesRequestBody
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/fees/${feeId}/classes/associate`, {
        method: "POST",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    async dissociateFeeClasses(
      token: string | null,
      feeId: string | number,
      body: AssociateFeeClassesRequestBody
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/fees/${feeId}/classes/dissociate`, {
        method: "DELETE",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    // Provinces / Villes (formulaires étudiants)
    getProvinces(token: string | null): Promise<AdminProvincesResponse> {
      return request<AdminProvincesResponse>("/api/v1/admin/provinces", {
        method: "GET",
        token,
      });
    },

    getProvinceCities(
      token: string | null,
      provinceId: string | number
    ): Promise<AdminProvinceCitiesResponse> {
      return request<AdminProvinceCitiesResponse>(
        `/api/v1/admin/provinces/${provinceId}/cities`,
        { method: "GET", token }
      );
    },

    // Étudiants (students)
    generateStudentCode(
      token: string | null
    ): Promise<AdminStudentCodeResponse> {
      return request<AdminStudentCodeResponse>(
        "/api/v1/admin/students/generate-code",
        { method: "GET", token }
      );
    },

    getStudents(
      token: string | null,
      page = 1
    ): Promise<AdminStudentsListResponse> {
      return request<AdminStudentsListResponse>(
        `/api/v1/admin/students?page=${page}`,
        { method: "GET", token }
      );
    },

    getStudent(
      token: string | null,
      id: string | number
    ): Promise<AdminStudentDetailResponse> {
      return request<AdminStudentDetailResponse>(
        `/api/v1/admin/students/${id}`,
        { method: "GET", token }
      );
    },

    getClassStudents(
      token: string | null,
      classId: string | number,
      page = 1
    ): Promise<AdminClassStudentsResponse> {
      return request<AdminClassStudentsResponse>(
        `/api/v1/admin/classes/${classId}/students?page=${page}`,
        { method: "GET", token }
      );
    },

    async createStudent(
      token: string | null,
      body: CreateStudentRequestBody
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return request("/api/v1/admin/students", {
        method: "POST",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    async updateStudent(
      token: string | null,
      id: string | number,
      body: UpdateStudentRequestBody
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/students/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    async deleteStudent(
      token: string | null,
      id: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/students/${id}`, {
        method: "DELETE",
        token,
        withCsrf: true,
      });
    },

    async restoreStudent(
      token: string | null,
      id: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/students/${id}/restore`, {
        method: "POST",
        token,
        withCsrf: true,
      });
    },

    async approveStudent(
      token: string | null,
      id: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/students/${id}/approve`, {
        method: "POST",
        token,
        withCsrf: true,
      });
    },

    async disapproveStudent(
      token: string | null,
      id: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/students/${id}/disapprove`, {
        method: "POST",
        token,
        withCsrf: true,
      });
    },

    getStudentFees(
      token: string | null,
      studentId: string | number,
      page = 1
    ): Promise<AdminStudentFeesListResponse> {
      return request<AdminStudentFeesListResponse>(
        `/api/v1/admin/students/${studentId}/fees?page=${page}`,
        { method: "GET", token }
      );
    },

    getStudentFee(
      token: string | null,
      studentId: string | number,
      feeId: string | number
    ): Promise<AdminStudentFeeDetailResponse> {
      return request<AdminStudentFeeDetailResponse>(
        `/api/v1/admin/students/${studentId}/fees/${feeId}`,
        { method: "GET", token }
      );
    },

    async createStudentFee(
      token: string | null,
      studentId: string | number,
      body: CreateStudentFeeRequestBody
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/students/${studentId}/fees`, {
        method: "POST",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    async updateStudentFee(
      token: string | null,
      studentId: string | number,
      feeId: string | number,
      body: UpdateStudentFeeRequestBody
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/students/${studentId}/fees/${feeId}`, {
        method: "PUT",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    async deleteStudentFee(
      token: string | null,
      studentId: string | number,
      feeId: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/students/${studentId}/fees/${feeId}`, {
        method: "DELETE",
        token,
        withCsrf: true,
      });
    },

    async restoreStudentFee(
      token: string | null,
      studentId: string | number,
      feeId: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/students/${studentId}/fees/${feeId}/restore`, {
        method: "POST",
        token,
        withCsrf: true,
      });
    },

    getStudentGroupFees(
      token: string | null,
      groupId: string | number,
      page = 1
    ): Promise<AdminStudentGroupFeesListResponse> {
      return request<AdminStudentGroupFeesListResponse>(
        `/api/v1/admin/student-groups/${groupId}/fees?page=${page}`,
        { method: "GET", token }
      );
    },

    getStudentGroupFee(
      token: string | null,
      groupId: string | number,
      feeId: string | number
    ): Promise<AdminStudentGroupFeeDetailResponse> {
      return request<AdminStudentGroupFeeDetailResponse>(
        `/api/v1/admin/student-groups/${groupId}/fees/${feeId}`,
        { method: "GET", token }
      );
    },

    async createStudentGroupFee(
      token: string | null,
      groupId: string | number,
      body: CreateStudentGroupFeeRequestBody
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/student-groups/${groupId}/fees`, {
        method: "POST",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    async updateStudentGroupFee(
      token: string | null,
      groupId: string | number,
      feeId: string | number,
      body: UpdateStudentGroupFeeRequestBody
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/student-groups/${groupId}/fees/${feeId}`, {
        method: "PUT",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    async deleteStudentGroupFee(
      token: string | null,
      groupId: string | number,
      feeId: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/student-groups/${groupId}/fees/${feeId}`, {
        method: "DELETE",
        token,
        withCsrf: true,
      });
    },

    async restoreStudentGroupFee(
      token: string | null,
      groupId: string | number,
      feeId: string | number
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/student-groups/${groupId}/fees/${feeId}/restore`, {
        method: "POST",
        token,
        withCsrf: true,
      });
    },

    async createUser(
      token: string | null,
      formData: FormData
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return requestFormData("/api/v1/admin/users", {
        method: "POST",
        body: formData,
        token,
        withCsrf: true,
      });
    },

    getAdminUser(token: string | null, id: string): Promise<AdminUserProfileResponse> {
      return request<AdminUserProfileResponse>(`/api/v1/admin/users/${id}`, {
        method: "GET",
        token,
      });
    },

    async updateUser(
      token: string | null,
      id: string,
      formData: FormData
    ): Promise<{ status: string; message?: string; data?: unknown }> {
      await fetchCsrfCookie();
      return requestFormData(`/api/v1/admin/users/${id}`, {
        method: "PUT",
        body: formData,
        token,
        withCsrf: true,
      });
    },

    async deleteUser(token: string | null, id: string): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/users/${id}`, {
        method: "DELETE",
        token,
        withCsrf: true,
      });
    },

    async restoreUser(
      token: string | null,
      id: string
    ): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/users/${id}/restore`, {
        method: "POST",
        body: JSON.stringify({}),
        token,
        withCsrf: true,
      });
    },

    async resetPassword(
      token: string | null,
      id: string
    ): Promise<AdminResetPasswordResponse> {
      await fetchCsrfCookie();
      return request<AdminResetPasswordResponse>(`/api/v1/admin/users/${id}/reset-password`, {
        method: "POST",
        body: JSON.stringify({}),
        token,
        withCsrf: true,
      });
    },

    /** Changement de mot de passe de l'utilisateur connecté */
    async changePassword(
      token: string | null,
      body: ChangePasswordRequestBody
    ): Promise<ChangePasswordResponse> {
      await fetchCsrfCookie();
      return request<ChangePasswordResponse>("/api/v1/admin/users/change-password", {
        method: "PUT",
        body: JSON.stringify(body),
        token,
        withCsrf: true,
      });
    },

    /** Suppression de l'avatar de l'utilisateur (id = utilisateur connecté) */
    async deleteAvatar(token: string | null, userId: string): Promise<{ status: string; message?: string }> {
      await fetchCsrfCookie();
      return request(`/api/v1/admin/users/${userId}/avatar`, {
        method: "DELETE",
        token,
        withCsrf: true,
      });
    },

    /** Upload d'un avatar (fichier image) - POST upload-avatar, FormData clé "avatar" */
    async uploadAvatar(
      token: string | null,
      userId: string,
      formData: FormData
    ): Promise<{ status: string; message?: string; data?: { avatar_url?: string } }> {
      await fetchCsrfCookie();
      return requestFormData(`/api/v1/admin/users/${userId}/upload-avatar`, {
        method: "POST",
        body: formData,
        token,
        withCsrf: true,
      });
    },
  },

  parent: {
    searchSchools(token: string | null, search: string): Promise<ParentSchoolsSearchResponse> {
      const q = encodeURIComponent(search.trim());
      return request<ParentSchoolsSearchResponse>(
        `/api/v1/parent/schools/search?search=${q}`,
        { method: "GET", token }
      );
    },

    getSchoolClasses(token: string | null, schoolId: string | number): Promise<ParentSchoolClassesResponse> {
      return request<ParentSchoolClassesResponse>(
        `/api/v1/parent/schools/${schoolId}/classes`,
        { method: "GET", token }
      );
    },

    getClassStudents(token: string | null, classId: string | number): Promise<ParentClassStudentsResponse> {
      return request<ParentClassStudentsResponse>(
        `/api/v1/parent/classes/${classId}/students`,
        { method: "GET", token }
      );
    },

    checkChildLink(token: string | null, studentId: string | number): Promise<ParentChildCheckResponse> {
      return request<ParentChildCheckResponse>(
        `/api/v1/parent/children/${studentId}/check`,
        { method: "GET", token }
      );
    },

    async linkChild(token: string | null, studentId: number): Promise<ParentLinkChildResponse> {
      await fetchCsrfCookie();
      return request<ParentLinkChildResponse>("/api/v1/parent/children/link", {
        method: "POST",
        body: JSON.stringify({ student_id: studentId }),
        token,
        withCsrf: true,
      });
    },

    async unlinkChild(token: string | null, studentId: string | number): Promise<ParentUnlinkChildResponse> {
      await fetchCsrfCookie();
      return request<ParentUnlinkChildResponse>(
        `/api/v1/parent/children/${studentId}/unlink`,
        { method: "DELETE", token, withCsrf: true }
      );
    },

    getChildren(token: string | null): Promise<ParentChildrenResponse> {
      return request<ParentChildrenResponse>("/api/v1/parent/children", {
        method: "GET",
        token,
      });
    },

    getStatistics(token: string | null): Promise<ParentStatisticsResponse> {
      return request<ParentStatisticsResponse>("/api/v1/parent/statistics", {
        method: "GET",
        token,
      });
    },
  },
};
