import axiosInstance from '../axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  phoneNumber?: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterData) {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },

  async verifyEmail(token: string) {
    const response = await axiosInstance.post('/auth/verify-email', { token });
    return response.data;
  },

  async forgotPassword(email: string) {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, password: string) {
    const response = await axiosInstance.post('/auth/reset-password', { token, password });
    return response.data;
  }
};