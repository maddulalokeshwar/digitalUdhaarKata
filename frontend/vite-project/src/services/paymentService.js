import axiosInstance from './axiosInstance'

const BASE = '/payment-api'

export const paymentService = {
  add: (data) =>
    axiosInstance.post(`${BASE}/add`, data),

  getByCustomer: (customerId) =>
    axiosInstance.get(`${BASE}/customer/${customerId}`),

  getById: (paymentId) =>
    axiosInstance.get(`${BASE}/${paymentId}`),

  update: (paymentId, data) =>
    axiosInstance.put(`${BASE}/${paymentId}`, data),

  delete: (paymentId) =>
    axiosInstance.delete(`${BASE}/${paymentId}`),
}