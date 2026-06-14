import axiosInstance from './axiosInstance'

const BASE = '/transaction-api'

export const transactionService = {
  add: (data) =>
    axiosInstance.post(`${BASE}/add`, data),

  getAll: (params = {}) =>
    axiosInstance.get(BASE, { params }),

  getByCustomer: (customerId) =>
    axiosInstance.get(`${BASE}/customer/${customerId}`),

  getById: (transactionId) =>
    axiosInstance.get(`${BASE}/${transactionId}`),

  update: (transactionId, data) =>
    axiosInstance.put(`${BASE}/${transactionId}`, data),

  delete: (transactionId) =>
    axiosInstance.delete(`${BASE}/${transactionId}`),

  settle: (transactionId, settledAmount) =>
    axiosInstance.patch(`${BASE}/${transactionId}/settle`, { settledAmount }),
}