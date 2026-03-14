import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SOCKET_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // request chờ refresh xong
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post(`/auth/refreshToken`);

        const newAccessToken = res.data.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);

        processQueue(null, newAccessToken);

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("accessToken");
        window.location.href = "/auth";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
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
