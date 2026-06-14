import axiosInstance from './axiosInstance'

const BASE = '/customer-dashboard'

export const customerDashboardService = {
  getSummary: () => axiosInstance.get(`${BASE}/summary`),
  getTransactions: (page = 1, limit = 20, type = '') =>
    axiosInstance.get(`${BASE}/transactions`, { params: { page, limit, ...(type && { type }) } }),
  getPayments: (page = 1, limit = 20) =>
    axiosInstance.get(`${BASE}/payments`, { params: { page, limit } }),
  getStatement: (month, year) =>
    axiosInstance.get(`${BASE}/statement`, { params: { month, year }, responseType: 'blob' }),
  getReminders: () => axiosInstance.get(`${BASE}/reminders`),
  getOutstanding: () => axiosInstance.get(`${BASE}/outstanding`),
}