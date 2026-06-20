import apiClient from './client';

export interface SmsExtractResult {
  amount: string;
  currency: string;
  merchant: string;
  user_id: string;
}

export const analyzeSmsApi = async (message: string): Promise<SmsExtractResult> => {
  const res = await apiClient.post<SmsExtractResult>('/v1/ds/message', { message });
  return res.data;
};
