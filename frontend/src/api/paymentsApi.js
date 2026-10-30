import apiClient from './client';

export const paymentsApi = {
  getPaymentById: async (id) => {
    const res = await apiClient.get(`/payments/${id}`);
    return res.data;
  },
};
