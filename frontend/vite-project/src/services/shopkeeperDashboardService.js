import axiosInstance from './axiosInstance'

export const customerDashboardService = {
  getSummary: () =>
    axiosInstance.get('/shop-dashboard/summary'),
}