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

export default api;
