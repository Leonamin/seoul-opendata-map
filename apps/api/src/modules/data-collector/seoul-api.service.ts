import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface SeoulPopulationRecord {
  areaCode: string;
  areaName: string;
  totalPopulation: number;
  malePopulation: number;
  femalePopulation: number;
  age0to9: number;
  age10to19: number;
  age20to29: number;
  age30to39: number;
  age40to49: number;
  age50to59: number;
  age60plus: number;
  residentRatio: number;
  visitorRatio: number;
  congestionLevel: string;
  timestamp: Date;
}

@Injectable()
export class SeoulApiService {
  private readonly logger = new Logger(SeoulApiService.name);
  private readonly httpClient: AxiosInstance;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('SEOUL_API_KEY', '');
    this.httpClient = axios.create({
      baseURL: 'http://openapi.seoul.go.kr:8088',
      timeout: 10000,
    });
  }

  async fetchPopulationData(areaCode: string): Promise<SeoulPopulationRecord | null> {
    if (!this.apiKey) {
      this.logger.warn('SEOUL_API_KEY not configured');
      return null;
    }

    try {
      const url = `/${this.apiKey}/json/citydata_ppltn/1/1/${encodeURIComponent(areaCode)}`;
      const response = await this.httpClient.get<unknown>(url);
      const data = response.data as Record<string, unknown>;
      const cityData = (data['SeoulRtd.citydata_ppltn'] as Record<string, unknown>[] | undefined)?.[0];

      if (!cityData) return null;

      return {
        areaCode,
        areaName: String(cityData['AREA_NM'] ?? ''),
        totalPopulation: parseInt(String(cityData['AREA_PPLTN_MAX'] ?? '0'), 10),
        malePopulation: parseInt(String(cityData['MALE_PPLTN_RATE'] ?? '0'), 10),
        femalePopulation: parseInt(String(cityData['FEMALE_PPLTN_RATE'] ?? '0'), 10),
        age0to9: parseFloat(String(cityData['PPLTN_RATE_0'] ?? '0')),
        age10to19: parseFloat(String(cityData['PPLTN_RATE_10'] ?? '0')),
        age20to29: parseFloat(String(cityData['PPLTN_RATE_20'] ?? '0')),
        age30to39: parseFloat(String(cityData['PPLTN_RATE_30'] ?? '0')),
        age40to49: parseFloat(String(cityData['PPLTN_RATE_40'] ?? '0')),
        age50to59: parseFloat(String(cityData['PPLTN_RATE_50'] ?? '0')),
        age60plus: parseFloat(String(cityData['PPLTN_RATE_60'] ?? '0')),
        residentRatio: parseFloat(String(cityData['RESNT_PPLTN_RATE'] ?? '0')),
        visitorRatio: parseFloat(String(cityData['NON_RESNT_PPLTN_RATE'] ?? '0')),
        congestionLevel: String(cityData['AREA_CONGEST_LVL'] ?? '여유'),
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch population for ${areaCode}`, error);
      return null;
    }
  }
}
