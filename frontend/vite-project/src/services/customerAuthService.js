import axiosInstance from './axiosInstance'

const BASE = '/customer-auth'

export const customerAuthService = {
  register: (data) =>
    axiosInstance.post(`${BASE}/register`, data),

  login: (mobile, password) =>
    axiosInstance.post(`${BASE}/login`, { mobile, password }),

  sendOtp: (mobile) =>
    axiosInstance.post(`${BASE}/send-otp`, { mobile }),

  verifyOtp: (mobile, otp) =>
    axiosInstance.post(`${BASE}/verify-otp`, { mobile, otp }),

  forgotPassword: (mobile) =>
    axiosInstance.post(`${BASE}/forgot-password`, { mobile }),

  resetPassword: (mobile, otp, newPassword) =>
    axiosInstance.post(`${BASE}/reset-password`, { mobile, otp, newPassword }),

  getProfile: () =>
    axiosInstance.get(`${BASE}/profile`),

  updateProfile: (data) =>
    axiosInstance.put(`${BASE}/profile`, data),

  changePassword: (currentPassword, newPassword) =>
    axiosInstance.put(`${BASE}/change-password`, { currentPassword, newPassword }),

  updateNotificationPreferences: (email, push) =>
    axiosInstance.put(`${BASE}/notification-preferences`, { email, push }),

  logout: () =>
    axiosInstance.post(`${BASE}/logout`),
}