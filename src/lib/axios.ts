import axios, { type AxiosError } from "axios";
import { PUBLIC_ENDPOINTS } from "./constants";
import { getClientData } from "./utils";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuthRedirect?: boolean;
    _retry?: boolean;
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const isPublicEndpoint = (url?: string) =>
  PUBLIC_ENDPOINTS.some((endpoint) => url?.includes(endpoint));

let clientDataCache: Awaited<ReturnType<typeof getClientData>> | null = null;

async function getCachedClientData() {
  if (!clientDataCache) {
    clientDataCache = await getClientData();
  }
  return clientDataCache;
}

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

const refreshAccessToken = async () => {
  await axios.post(
    `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
    {},
    { withCredentials: true },
  );
};

api.interceptors.request.use(
  async (config) => {
    config.headers = config.headers ?? {};

    try {
      const clientData = await getCachedClientData();

      config.headers["X-Client-UserAgent"] = clientData.userAgent;

      if (clientData.latitude && clientData.longitude) {
        config.headers["X-Client-Latitude"] = clientData.latitude;
        config.headers["X-Client-Longitude"] = clientData.longitude;
      }
    } catch (err) {
      console.warn("Failed to attach client metadata:", err);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config;

    // Network error
    if (!error.response) {
      return Promise.reject({
        message: "Network error. Please check your connection.",
      });
    }

    // Timeout
    if (error.code === "ECONNABORTED") {
      return Promise.reject({ message: "Request timed out." });
    }

    // Skip refresh for public endpoints (login, register, etc.) — a 401/422
    // here means bad credentials or invalid input, not an expired session.
    // Still normalize the rejection so the real backend message (e.g.
    // "Invalid password") reaches the UI instead of Axios's generic
    // "Request failed with status code 401".
    if (isPublicEndpoint(originalRequest?.url)) {
      return Promise.reject({
        status: error.response.status,
        message: error.response.data?.message || error.message || "Something went wrong",
        data: error.response.data,
      });
    }

    // Handle expired access token
    if (error.response.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = refreshAccessToken();
        }

        await refreshPromise;

        isRefreshing = false;
        refreshPromise = null;

        return api(originalRequest);
      } catch {
        isRefreshing = false;
        refreshPromise = null;

        if (!originalRequest.skipAuthRedirect) {
          window.location.href = "/signin";
        }

        return Promise.reject({
          status: 401,
          message: "Your session has expired. Please sign in again.",
          sessionExpired: true,
        });
      }
    }

    return Promise.reject({
      status: error.response.status,
      message:
        error.response.data?.message || error.message || "Something went wrong",
      data: error.response.data,
    });
  },
);
