import { AxiosError } from 'axios';

export const handleApiError = (error: unknown) => {
  if (error instanceof AxiosError) {
    return {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    };
  }
  
  return {
    status: 500,
    message: 'An unexpected error occurred',
    data: null
  };
};