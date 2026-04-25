import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://smart-season-8flo.onrender.com/api"

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      !original._retry &&
      error.response?.data?.code === "token_expired"
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, null, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });
        const newToken = data.data.access_token;
        localStorage.setItem("access_token", newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;


export const authService = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/me", data),
  refresh: () => {
    const rt = localStorage.getItem("refresh_token");
    return axios.post(`${BASE_URL}/auth/refresh`, null, {
      headers: { Authorization: `Bearer ${rt}` },
    });
  },
};


export const fieldService = {
  list: (params = {}) => api.get("/fields", { params }),
  get: (id) => api.get(`/fields/${id}`),
  create: (data) => api.post("/fields", data),
  update: (id, data) => api.put(`/fields/${id}`, data),
  updateStage: (id, stage) => api.patch(`/fields/${id}/stage`, { stage }),
  delete: (id) => api.delete(`/fields/${id}`),
};


export const noteService = {
  list: (fieldId) => api.get(`/notes/fields/${fieldId}/notes`),
  add: (fieldId, note_text) =>
    api.post(`/notes/fields/${fieldId}/notes`, { note_text }),
  delete: (noteId) => api.delete(`/notes/notes/${noteId}`),
};


export const userService = {
  list: (params = {}) => api.get("/users", { params }),
  agents: () => api.get("/users/agents"),
  get: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};


export const dashboardService = {
  admin: () => api.get("/dashboard/admin"),
  agent: () => api.get("/dashboard/agent"),
};
