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
};
