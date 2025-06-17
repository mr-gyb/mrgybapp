export interface IntegrationTile {
  name: string;
  logo: string;
  description: string;
  connectUrl: string;
}

export interface IntegrationStatus {
  isConnected: boolean;
  lastSync?: string;
  error?: string;
}

export interface IntegrationError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}