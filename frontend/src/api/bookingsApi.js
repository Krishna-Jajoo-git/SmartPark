import apiClient from './client';

export const bookingsApi = {
  createBooking: async (payload) => {
    const res = await apiClient.post('/bookings', payload);
    return res.data;
  },

  getActiveBookings: async () => {
    const res = await apiClient.get('/bookings/active');
    return res.data;
  },

  getBookingById: async (id) => {
    const res = await apiClient.get(`/bookings/${id}`);
    return res.data;
  },

  getBookingByVehicle: async (vehicleNumber) => {
    const res = await apiClient.get(`/bookings/vehicle/${encodeURIComponent(vehicleNumber)}`);
    return res.data;
  },

  getFareEstimate: async (id) => {
    const res = await apiClient.get(`/bookings/${id}/fare`);
    return res.data;
  },

  checkout: async (id, paymentMethod) => {
    const res = await apiClient.post(`/bookings/${id}/checkout`, null, {
      params: paymentMethod ? { paymentMethod } : {},
    });
    return res.data;
  },
};
