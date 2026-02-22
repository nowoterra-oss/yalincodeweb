import dayjs from 'dayjs';
import { DATE_FORMAT, DATETIME_FORMAT } from './constants';

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  return dayjs(date).format(DATE_FORMAT);
};

export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  return dayjs(date).format(DATETIME_FORMAT);
};

export const formatCurrency = (
  amount: number | null | undefined,
  currency: string = 'TRY'
): string => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('tr-TR').format(num);
};

export const getDaysUntil = (date: string | Date): number => {
  return dayjs(date).diff(dayjs(), 'day');
};

export const isExpiringSoon = (date: string | Date, days: number = 30): boolean => {
  const daysUntil = getDaysUntil(date);
  return daysUntil > 0 && daysUntil <= days;
};

export const isExpired = (date: string | Date): boolean => {
  return dayjs(date).isBefore(dayjs());
};
