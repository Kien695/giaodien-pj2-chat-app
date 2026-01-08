import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SOCKET_URL,
  withCredentials: true, // gửi cookie httpOnly
});

// Interceptor tự động refresh token khi 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // chỉ retry 1 lần
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // gọi refresh token
        const res = await api.post("/auth/refresh-token");
        const newAccessToken = res.data.accessToken;

        // lưu token mới vào localStorage
        localStorage.setItem("accessToken", newAccessToken);

        // gắn token mới và retry request
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // refresh token hết hạn → logout FE hoặc redirect login
        console.error("Refresh token failed", refreshError);
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// getData
export const getData = async (url) => {
  const response = await api.get(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
    },
  });
  return response.data;
};

// postData (JSON hoặc FormData)
export const postData = async (url, data) => {
  const isFormData = data instanceof FormData;
  const response = await api.post(url, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
  });
  return response.data;
};
// PUT
export const putData = async (url, data) => {
  const isFormData = data instanceof FormData;
  const response = await api.put(url, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
  });
  return response.data;
};

// PATCH
export const patchData = async (url, data) => {
  const isFormData = data instanceof FormData;
  const response = await api.patch(url, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
  });
  return response.data;
};

// DELETE
export const deleteData = async (url) => {
  const response = await api.delete(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
    },
  });
  return response.data;
};
