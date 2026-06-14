import axiosInstance from './axiosInstance'

const BASE = '/customer-api'

export const customerService = {
  add: (data) =>
    axiosInstance.post(`${BASE}/add`, data),

  getAll: (page = 1, limit = 20) =>
    axiosInstance.get(BASE, { params: { page, limit } }),

  search: (q) =>
    axiosInstance.get(`${BASE}/search`, { params: { q } }),

  getById: (customerId) =>
    axiosInstance.get(`${BASE}/${customerId}`),

  getBalance: (customerId) =>
    axiosInstance.get(`${BASE}/${customerId}/balance`),

  update: (customerId, data) =>
    axiosInstance.put(`${BASE}/${customerId}`, data),

  deactivate: (customerId) =>
    axiosInstance.delete(`${BASE}/${customerId}`),

  reactivate: (customerId) =>
    axiosInstance.patch(`${BASE}/${customerId}/reactivate`),

  findShop: (mobile) =>
    axiosInstance.get(`${BASE}/find-shop`, { params: { mobile } }),
}