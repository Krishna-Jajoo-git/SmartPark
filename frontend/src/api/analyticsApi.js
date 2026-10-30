import apiClient from './client';

export const analyticsApi = {
  getSummary: async () => {
    const res = await apiClient.get('/analytics/summary');
    return res.data;
  },

  getRevenueByDate: async (dateStr) => {
    const params = dateStr ? { date: dateStr } : {};
    const res = await apiClient.get('/analytics/revenue', { params });
    return res.data;
  },
};
