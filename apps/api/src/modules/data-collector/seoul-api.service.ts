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

  /**
   * Fetch real-time population data from Seoul Open API.
   *
   * The citydata_ppltn endpoint requires the **area name** (e.g. "강남 MICE 관광특구"),
   * not a numeric code. The caller should pass the name stored in LocationEntity.
   *
   * Response structure:
   * {
   *   "SeoulRtd.citydata_ppltn": [{
   *     "AREA_NM": "강남 MICE 관광특구",
   *     "AREA_CD": "POI001",
   *     "AREA_CONGEST_LVL": "보통",
   *     "AREA_PPLTN_MIN": "32000",
   *     "AREA_PPLTN_MAX": "34000",
   *     "MALE_PPLTN_RATE": "52.3",
   *     "FEMALE_PPLTN_RATE": "47.7",
   *     "PPLTN_RATE_0": "1.2",
   *     ...
   *     "RESNT_PPLTN_RATE": "30.5",
   *     "NON_RESNT_PPLTN_RATE": "69.5"
   *   }]
   * }
   */
  async fetchPopulationData(areaName: string, areaCode?: string): Promise<SeoulPopulationRecord | null> {
    if (!this.apiKey) {
      this.logger.warn('SEOUL_API_KEY not configured — skipping API call');
      return null;
    }

    try {
      const url = `/${this.apiKey}/json/citydata_ppltn/1/5/${encodeURIComponent(areaName)}`;
      const response = await this.httpClient.get<unknown>(url);
      const data = response.data as Record<string, unknown>;

      // The API wraps results in "SeoulRtd.citydata_ppltn" array
      const records = data['SeoulRtd.citydata_ppltn'] as Record<string, unknown>[] | undefined;
      if (!records || records.length === 0) {
        this.logger.warn(`No population data returned for: ${areaName}`);
        return null;
      }

      const cityData = records[0];

      // AREA_PPLTN_MIN and MAX define a range; use the average as totalPopulation
      const ppltnMin = parseInt(String(cityData['AREA_PPLTN_MIN'] ?? '0'), 10);
      const ppltnMax = parseInt(String(cityData['AREA_PPLTN_MAX'] ?? '0'), 10);
      const totalPopulation = Math.round((ppltnMin + ppltnMax) / 2);

      // Rate fields are percentages (e.g. "52.3"), not absolute counts
      const maleRate = parseFloat(String(cityData['MALE_PPLTN_RATE'] ?? '0'));
      const femaleRate = parseFloat(String(cityData['FEMALE_PPLTN_RATE'] ?? '0'));

      return {
        areaCode: areaCode ?? String(cityData['AREA_CD'] ?? ''),
        areaName: String(cityData['AREA_NM'] ?? areaName),
        totalPopulation,
        malePopulation: Math.round(totalPopulation * maleRate / 100),
        femalePopulation: Math.round(totalPopulation * femaleRate / 100),
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
      this.logger.error(`Failed to fetch population for ${areaName}`, error);
      return null;
    }
  }
}
