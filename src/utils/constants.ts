export const APP_NAME = import.meta.env.VITE_APP_NAME || 'CeoElevator ERP';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:15000';

export const TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const USER_KEY = 'user';
export const TENANT_KEY = 'tenant';

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const DATE_FORMAT = 'DD.MM.YYYY';
export const DATETIME_FORMAT = 'DD.MM.YYYY HH:mm';
export const TIME_FORMAT = 'HH:mm';
