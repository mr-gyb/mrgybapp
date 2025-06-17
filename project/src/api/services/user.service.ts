import axiosInstance from '../axios';
import { UserData } from '../../types/user';

export const userService = {
  async getCurrentUser() {
    const response = await axiosInstance.get('/users/me');
    return response.data;
  },

  async updateProfile(data: Partial<UserData>) {
    const response = await axiosInstance.put('/users/profile', data);
    return response.data;
  },

  async updateSettings(settings: any) {
    const response = await axiosInstance.put('/users/settings', settings);
    return response.data;
  },

  async getNotifications() {
    const response = await axiosInstance.get('/users/notifications');
    return response.data;
  }
};