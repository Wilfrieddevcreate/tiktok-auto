import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class TikTokApiClient {
  private readonly http: AxiosInstance = axios.create({ baseURL: process.env.TIKTOK_API_BASE_URL ?? 'https://open.tiktokapis.com', timeout: 15000 });
  async post<T>(path: string, token: string, body: unknown): Promise<T> {
    const response = await this.http.post<T>(path, body, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
    return response.data;
  }
}
