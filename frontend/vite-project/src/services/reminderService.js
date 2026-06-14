import axiosInstance from './axiosInstance'

const BASE = '/reminder-api'

export const reminderService = {
  send: (data) =>
    axiosInstance.post(`${BASE}/send`, data),

  sendEmail: (data) =>
    axiosInstance.post(`${BASE}/sendEmail`, data),

  schedule: (data) =>
    axiosInstance.post(`${BASE}/schedule`, data),

  sendBulk: (data) =>
    axiosInstance.post(`${BASE}/bulk`, data),

  getAll: (params = {}) =>
    axiosInstance.get(BASE, { params }),

  getByCustomer: (customerId) =>
    axiosInstance.get(`${BASE}/customer/${customerId}`),

  cancel: (reminderId) =>
    axiosInstance.delete(`${BASE}/${reminderId}`),
}