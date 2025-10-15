
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = 'http://localhost:8000'; // Asume que el backend corre en el puerto 8000

const getAuthToken = () => {
  // Accede al token desde el store de Zustand
  return useAuthStore.getState().token;
};

const api = {
  async get<T>(endpoint: string): Promise<T> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async post<T>(endpoint: string, body: any): Promise<T> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // Intenta parsear el error del cuerpo de la respuesta para más detalles
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Puedes añadir aquí métodos para PUT, DELETE, etc. si los necesitas
};

export default api;

