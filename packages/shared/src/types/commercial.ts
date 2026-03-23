export interface CommercialData {
  id: string;
  locationId: string;
  periodDate: string;
  businessTypeCode: string;
  businessTypeName: string;
  totalSales: number;
  transactionCount: number;
  storeCount: number;
  avgSalesPerStore: number;
  source: string;
}

export interface CommercialByLocationQuery {
  locationId: string;
  startDate: string;
  endDate: string;
}

export interface CommercialCompareQuery {
  locationIds: string[];
  period1: string;
  period2: string;
}

export interface BusinessType {
  code: string;
  name: string;
  color: string;
}
