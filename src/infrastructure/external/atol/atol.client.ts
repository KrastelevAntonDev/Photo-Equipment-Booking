import axios, { AxiosInstance } from 'axios';
import {
  AtolConfig,
  AtolTokenResponse,
  AtolSellRequest,
  AtolSellResponse,
  AtolReportResponse,
  AtolOperationType
} from './atol.types';

export class AtolClient {
  private axiosInstance: AxiosInstance;
  private config: AtolConfig;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: AtolConfig) {
    this.config = config;
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Получение токена авторизации
   */
  private async getToken(): Promise<string> {
    // Проверяем, есть ли валидный токен
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await this.axiosInstance.post<AtolTokenResponse>(
        '/possystem/v5/getToken',
        {
          login: this.config.login,
          pass: this.config.password
        }
      );

      if (response.data.error) {
        throw new Error(`ATOL Auth Error: ${response.data.error.text} (${response.data.error.code})`);
      }

      this.token = response.data.token;
      // Токен действителен 24 часа, ставим на 23 часа для безопасности
      this.tokenExpiry = new Date(Date.now() + 23 * 60 * 60 * 1000);
      
      return this.token;
    } catch (error: any) {
      console.error('[ATOL] Failed to get token:', error.message);
      throw new Error(`Failed to authenticate with ATOL: ${error.message}`);
    }
  }

  /**
   * Создание чека прихода (продажа)
   */
  async createSellReceipt(request: AtolSellRequest): Promise<AtolSellResponse> {
    const token = await this.getToken();

    try {
      const response = await this.axiosInstance.post<AtolSellResponse>(
        `/possystem/v5/${this.config.groupCode}/${AtolOperationType.Sell}`,
        request,
        {
          headers: {
            'Token': token
          }
        }
      );

      if (response.data.error) {
        throw new Error(`ATOL Sell Error: ${response.data.error.text} (${response.data.error.code})`);
      }

      return response.data;
    } catch (error: any) {
      console.error('[ATOL] Failed to create sell receipt:', error.message);
      throw new Error(`Failed to create ATOL receipt: ${error.message}`);
    }
  }

  /**
   * Создание чека возврата
   */
  async createRefundReceipt(request: AtolSellRequest): Promise<AtolSellResponse> {
    const token = await this.getToken();

    try {
      const response = await this.axiosInstance.post<AtolSellResponse>(
        `/possystem/v5/${this.config.groupCode}/${AtolOperationType.SellRefund}`,
        request,
        {
          headers: {
            'Token': token
          }
        }
      );

      if (response.data.error) {
        throw new Error(`ATOL Refund Error: ${response.data.error.text} (${response.data.error.code})`);
      }

      return response.data;
    } catch (error: any) {
      console.error('[ATOL] Failed to create refund receipt:', error.message);
      throw new Error(`Failed to create ATOL refund: ${error.message}`);
    }
  }

  /**
   * Получение отчета о чеке
   */
  async getReport(uuid: string): Promise<AtolReportResponse> {
    const token = await this.getToken();

    try {
      const response = await this.axiosInstance.get<AtolReportResponse>(
        `/possystem/v5/${this.config.groupCode}/report/${uuid}`,
        {
          headers: {
            'Token': token
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('[ATOL] Failed to get report:', error.message);
      throw new Error(`Failed to get ATOL report: ${error.message}`);
    }
  }

  /**
   * Ожидание готовности чека (polling)
   */
  async waitForReceipt(uuid: string, maxAttempts: number = 30, delayMs: number = 2000): Promise<AtolReportResponse> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const report = await this.getReport(uuid);

      if (report.status === 'done') {
        return report;
      }

      if (report.status === 'fail') {
        throw new Error(`ATOL receipt failed: ${report.error?.text || 'Unknown error'}`);
      }

      // Ждём перед следующей попыткой
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    throw new Error('ATOL receipt timeout: exceeded maximum attempts');
  }
}
