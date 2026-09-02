export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string | unknown;
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://testing-production-1105.up.railway.app/api/v1";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401 && typeof window !== "undefined") {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken && !endpoint.includes("/auth/refresh-token")) {
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((newToken) => {
            headers["Authorization"] = `Bearer ${newToken}`;
            return apiClient<T>(endpoint, { ...options, headers });
          });
        }

        isRefreshing = true;

        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const newToken =
              refreshData.accessToken || refreshData.data?.accessToken;

            if (newToken) {
              localStorage.setItem("accessToken", newToken);
              localStorage.setItem("token", newToken);
              if (refreshData.refreshToken || refreshData.data?.refreshToken) {
                localStorage.setItem(
                  "refreshToken",
                  refreshData.refreshToken || refreshData.data?.refreshToken
                );
              }

              processQueue(null, newToken);
              headers["Authorization"] = `Bearer ${newToken}`;
              return apiClient<T>(endpoint, { ...options, headers });
            }
          }

          processQueue(new Error("Session expired"), null);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
        } catch (refreshErr) {
          processQueue(refreshErr, null);
        } finally {
          isRefreshing = false;
        }
      }
    }

    const contentType = res.headers.get("content-type");
    let responseData: Record<string, unknown> | null = null;
    if (contentType && contentType.includes("application/json")) {
      responseData = (await res.json()) as Record<string, unknown>;
    }

    if (!res.ok) {
      const errorMsg =
        (typeof responseData?.message === "string" ? responseData.message : null) ||
        (typeof responseData?.error === "string" ? responseData.error : null) ||
        `HTTP Error ${res.status}: ${res.statusText}`;
      throw new ApiError(errorMsg, res.status, responseData);
    }

    if (responseData && typeof responseData === "object" && "data" in responseData && responseData.data !== undefined) {
      return responseData.data as T;
    }

    return responseData as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const msg = err instanceof Error ? err.message : "Network error. Server connection failed.";
    throw new ApiError(msg, 0);
  }
}

apiClient.get = <T = unknown>(endpoint: string, options?: RequestInit) =>
  apiClient<T>(endpoint, { ...options, method: "GET" });

apiClient.post = <T = unknown>(endpoint: string, body?: unknown, options?: RequestInit) =>
  apiClient<T>(endpoint, {
    ...options,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });

apiClient.put = <T = unknown>(endpoint: string, body?: unknown, options?: RequestInit) =>
  apiClient<T>(endpoint, {
    ...options,
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });

apiClient.patch = <T = unknown>(endpoint: string, body?: unknown, options?: RequestInit) =>
  apiClient<T>(endpoint, {
    ...options,
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });

apiClient.delete = <T = unknown>(endpoint: string, options?: RequestInit) =>
  apiClient<T>(endpoint, { ...options, method: "DELETE" });

apiClient.uploadForm = <T = unknown>(endpoint: string, formData: FormData, options?: RequestInit) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") || localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://testing-production-1105.up.railway.app/api/v1";
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  return fetch(url, {
    method: "POST",
    headers,
    body: formData,
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) {
      throw new ApiError(data.message || data.error || "Upload failed", res.status, data);
    }
    return (data.data !== undefined ? data.data : data) as T;
  });
};
