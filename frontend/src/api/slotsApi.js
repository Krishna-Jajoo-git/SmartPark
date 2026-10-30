import apiClient from './client';

export const slotsApi = {
  getAllSlots: async () => {
    const res = await apiClient.get('/slots');
    return res.data;
  },
  
  getAvailableSlots: async () => {
    const res = await apiClient.get('/slots/available');
    return res.data;
  },
  
  getSlotById: async (id) => {
    const res = await apiClient.get(`/slots/${id}`);
    return res.data;
  },
};
