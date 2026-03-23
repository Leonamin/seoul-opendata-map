import { BusinessType } from '../types/commercial';

export const BUSINESS_TYPES: BusinessType[] = [
  { code: 'CS100001', name: '한식음식점', color: '#FF6B35' },
  { code: 'CS100002', name: '중식음식점', color: '#E8363A' },
  { code: 'CS100003', name: '일식음식점', color: '#1B4965' },
  { code: 'CS100004', name: '양식음식점', color: '#5FA8D3' },
  { code: 'CS100005', name: '제과점', color: '#F4A261' },
  { code: 'CS100006', name: '패스트푸드', color: '#E76F51' },
  { code: 'CS100007', name: '치킨전문점', color: '#D4A373' },
  { code: 'CS100008', name: '분식전문점', color: '#CCD5AE' },
  { code: 'CS100009', name: '호프-간이주점', color: '#6B705C' },
  { code: 'CS100010', name: '커피-음료', color: '#A98467' },
  { code: 'CS200001', name: '의류', color: '#7209B7' },
  { code: 'CS200002', name: '화장품', color: '#F72585' },
  { code: 'CS200003', name: '미용실', color: '#B5179E' },
  { code: 'CS200004', name: '편의점', color: '#3F37C9' },
  { code: 'CS200005', name: '슈퍼마켓', color: '#4361EE' },
  { code: 'CS300001', name: '의원', color: '#2EC4B6' },
  { code: 'CS300002', name: '약국', color: '#CBF3F0' },
  { code: 'CS300003', name: '학원', color: '#FFBF69' },
  { code: 'CS300004', name: '부동산중개업', color: '#FF9F1C' },
  { code: 'CS300005', name: '세탁소', color: '#C1D3FE' },
];

export const BUSINESS_TYPE_MAP = new Map(
  BUSINESS_TYPES.map((bt) => [bt.code, bt]),
);
