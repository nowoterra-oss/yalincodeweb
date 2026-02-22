import { api } from '@config/ceoelevator-config';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

export class ApiService {
  private static logApiError(error: any, context: string, additionalData?: any) {
    console.error(`API Error [${context}]:`, error);
    console.error('Error details:', {
      context,
      error_type: error?.response?.status ? 'http_error' : 'network_error',
      status_code: error?.response?.status || 'unknown',
      url: error?.config?.url || 'unknown',
      method: error?.config?.method || 'unknown',
      timestamp: new Date().toISOString(),
      ...additionalData,
    });
  }

  static async call<T>(
    promise: Promise<AxiosResponse<{ payload: T; error: any; hasError: boolean }>>
  ): Promise<T> {
    try {
      const response = await promise;
      const { hasError, error, payload } = response.data;

      if (hasError) {
        const backendKey = error?.code || error?.message;
        const errorMessage = backendKey || 'Bilinmeyen hata';

        this.logApiError(error, 'backend_error', {
          backend_error_code: backendKey,
          backend_error_message: error?.message,
        });

        const enrichedError = new Error(errorMessage);
        (enrichedError as any).original = error;
        throw enrichedError;
      }

      return payload;
    } catch (err: any) {
      if (err?.response?.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const { AppConfig } = await import('@config/ceoelevator-config');
            const refreshResponse = await axios.post(`${AppConfig.apiUrl}/iam/auth/RefreshToken`, {
              refreshToken,
              platform: 0,
            });
            if (refreshResponse.data?.payload) {
              const { jwt: newJwt } = refreshResponse.data.payload;
              localStorage.setItem('jwt', newJwt);
              localStorage.setItem('accessToken', newJwt);
              const retryConfig = err.config;
              retryConfig.headers['Authorization'] = `Bearer ${newJwt}`;
              const retryResponse = await api.request(retryConfig);
              return retryResponse.data.payload;
            }
          } catch {
            // refresh failed
          }
        }

        localStorage.removeItem('jwt');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        const authError = new Error('Oturum suresi doldu - lutfen tekrar giris yapin');
        (authError as any).code = 'SESSION_EXPIRED';
        throw authError;
      }

      this.logApiError(err, 'network_error', {
        error_message: err?.message,
      });

      throw err;
    }
  }

  static async callMultipart<T>(
    url: string,
    formData: FormData,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    const token = localStorage.getItem('jwt');
    const response = await axios.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: token ? `Bearer ${token}` : '',
        ...(config.headers || {}),
      },
    });

    const data = response.data;
    const payload = data?.payload ?? data;

    if (data.hasError) {
      const backendKey = data.error?.code || data.error?.message;
      const enrichedError = new Error(backendKey || 'Bilinmeyen hata');
      (enrichedError as any).original = data.error;
      throw enrichedError;
    }

    return payload as T;
  }

  static async request<TResponse>(config: AxiosRequestConfig): Promise<TResponse> {
    try {
      const response = await api.request<TResponse>(config);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw {
          success: false,
          message: error.response.data?.message || 'Bir hata olustu',
          data: error.response.data,
          status: error.response.status,
        };
      }
      throw {
        success: false,
        message: error.message || 'Ag hatasi',
        data: null,
      };
    }
  }

  static async get<TResponse>(url: string, config?: AxiosRequestConfig): Promise<TResponse> {
    return this.request<TResponse>({ ...config, method: 'GET', url });
  }

  static async post<TRequest, TResponse>(url: string, data?: TRequest, config?: AxiosRequestConfig): Promise<TResponse> {
    return this.request<TResponse>({ ...config, method: 'POST', url, data });
  }

  static async put<TRequest, TResponse>(url: string, data?: TRequest, config?: AxiosRequestConfig): Promise<TResponse> {
    return this.request<TResponse>({ ...config, method: 'PUT', url, data });
  }

  static async delete<TResponse>(url: string, config?: AxiosRequestConfig): Promise<TResponse> {
    return this.request<TResponse>({ ...config, method: 'DELETE', url });
  }

  static async patch<TRequest, TResponse>(url: string, data?: TRequest, config?: AxiosRequestConfig): Promise<TResponse> {
    return this.request<TResponse>({ ...config, method: 'PATCH', url, data });
  }
}
