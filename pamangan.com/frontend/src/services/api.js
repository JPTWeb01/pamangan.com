import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
  timeout: 45000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.error || err.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export const recipeApi = {
  list: (params) => api.get("/recipes", { params }),
  get: (id) => api.get(`/recipes/${id}`),
  similar: (id) => api.get(`/recipes/${id}/similar`),
  search: (query, cuisine, difficulty) =>
    api.post("/search", { query, cuisine, difficulty }),
  generate: (name) => api.post("/generate", { name }),
  popular: (limit = 8) => api.get("/popular", { params: { limit } }),
  byCategory: (cuisine, params) => api.get(`/cuisine/${cuisine}`, { params }),
};

export const aiApi = {
  grocery: (recipe_ids) => api.post("/grocery", { recipe_ids }),
  nutrition: (recipe_id) => api.post("/nutrition", { recipe_id }),
  history: (recipe_id) => api.post("/history", { recipe_id }),
};

export const categoryApi = {
  list: () => api.get("/categories"),
};

const adminApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
  timeout: 45000,
  headers: { "Content-Type": "application/json" },
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.error || err.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export const adminApiService = {
  login: (username, password) =>
    adminApi.post("/admin/login", { username, password }),
  listRecipes: (page = 1, limit = 20) =>
    adminApi.get("/admin/recipes", { params: { page, limit } }),
  updateRecipe: (id, data) => adminApi.patch(`/admin/recipes/${id}`, data),
  uploadImage: (file) => {
    const form = new FormData();
    form.append("image", file);
    return axios.post("/recipe-upload.php", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((res) => res.data);
  },
  deleteRecipe: (id) => adminApi.delete(`/admin/recipes/${id}`),
  createRecipe: (data) => adminApi.post("/admin/recipes", data),
  refreshImage: (id) => adminApi.post(`/admin/recipes/${id}/refresh-image`),
};

export default api;
