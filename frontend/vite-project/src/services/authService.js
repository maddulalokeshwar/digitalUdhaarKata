import axiosInstance from './axiosInstance'

export const authService = {
  register: (data) => axiosInstance.post('/auth-api/register', data),
  login: (data) => axiosInstance.post('/auth-api/login', data),
  sendOtp: (mobile) => axiosInstance.post('/auth-api/send-otp', { mobile }),
  verifyOtp: (data) => axiosInstance.post('/auth-api/verify-otp', data),
  getProfile: () => axiosInstance.get('/auth-api/profile'),
  updateProfile: (data) => axiosInstance.put('/auth-api/profile', data),
  changePassword: (data) => axiosInstance.put('/auth-api/change-password', data),
  logout: () => axiosInstance.post('/auth-api/logout')
}

