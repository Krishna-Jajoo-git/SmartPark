import axios from 'axios';
import { Platform } from 'react-native';

// Configurable Backend API host:
// - Android Emulator requires 10.0.2.2 to reach host machine's localhost:8080
// - Web / iOS Simulator can use localhost:8080
// - Physical device can pass EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:8080/api
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
export const BASE_API_URL = process.env.EXPO_PUBLIC_API_URL || `${DEFAULT_HOST}/api`;

const apiClient = axios.create({
  baseURL: BASE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let friendlyMessage = 'Unable to connect to SmartPark server. Please verify backend is running.';
    
    if (error.response) {
      // Backend returned standardized ErrorResponse
      const data = error.response.data;
      if (data && data.message) {
        friendlyMessage = data.message;
      } else if (data && data.fieldErrors) {
        friendlyMessage = Object.values(data.fieldErrors).join(', ');
      } else {
        friendlyMessage = `Server error (${error.response.status})`;
      }
    } else if (error.code === 'ECONNABORTED') {
      friendlyMessage = 'Server request timed out. Please try again.';
    } else if (error.message) {
      friendlyMessage = error.message;
    }
    
    const enrichedError = new Error(friendlyMessage);
    enrichedError.original = error;
    enrichedError.status = error.response?.status;
    enrichedError.data = error.response?.data;
    return Promise.reject(enrichedError);
  }
);

export default apiClient;
