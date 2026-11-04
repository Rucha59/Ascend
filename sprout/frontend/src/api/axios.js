
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
    timeout: 30000,
});

// Attach the Sprout JWT unless a request explicitly supplies another token.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("sprout_token");

    if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        const isAuthRoute = err.config?.url?.includes("/auth/");

        if (err.response?.status === 401 && !isAuthRoute) {
            localStorage.removeItem("sprout_token");
            localStorage.removeItem("sprout_user");

            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        return Promise.reject(err);
    }
);

export default api;
