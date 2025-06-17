import { IntegrationError } from '../types/settings';

export function handleIntegrationError(error: unknown): IntegrationError {
  if (error instanceof Error) {
    return {
      code: 'INTEGRATION_ERROR',
      message: error.message,
      details: { stack: error.stack }
    };
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    details: { originalError: error }
  };
}