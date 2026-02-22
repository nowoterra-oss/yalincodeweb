/// <reference lib="dom" />

import axios, { AxiosInstance } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:15000';

export const AppConfig = {
  BaseApi: baseURL + '/',
  apiUrl: baseURL,

  CeoElevatorUrl: `${baseURL}/api/ceoelevator`,
  IAMUrl: `${baseURL}/iam`,
  FileProviderUrl: `${baseURL}/fileprovider`,
  FileStorageBaseUrl: `${baseURL}/file-storage/`,
};

export const api: AxiosInstance = axios.create({
  baseURL: AppConfig.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('jwt');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (config.url && config.url.includes('/iam/')) {
      try {
        const url = new URL(config.url, config.baseURL || AppConfig.apiUrl);
        const pathParts = url.pathname.split('/');
        if (pathParts.length >= 3 && pathParts[1] === 'iam') {
          pathParts[2] = pathParts[2].toLowerCase();
          config.url = url.origin + pathParts.join('/');
        }
      } catch (e) {
        console.error('URL parsing error:', e);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const response = await axios.post(`${AppConfig.apiUrl}/iam/auth/RefreshToken`, {
              refreshToken,
              platform: 0,
            });
            if (response.data?.payload) {
              const { jwt } = response.data.payload;
              localStorage.setItem('jwt', jwt);
              localStorage.setItem('accessToken', jwt);
              localStorage.setItem('refreshToken', response.data.payload.refreshToken);
              error.config.headers.Authorization = `Bearer ${jwt}`;
              return api.request(error.config);
            }
          } catch {
            localStorage.removeItem('jwt');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
          }
        } else {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
