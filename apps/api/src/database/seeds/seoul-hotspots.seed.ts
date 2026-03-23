import { DataSource } from 'typeorm';
import { LocationEntity } from '../../modules/location/location.entity.js';

const HOTSPOTS: Partial<LocationEntity>[] = [
  { name: '강남역', areaCode: 'POI001', lat: 37.4979, lng: 127.0276, category: '교통' },
  { name: '홍대입구', areaCode: 'POI002', lat: 37.5572, lng: 126.9238, category: '문화' },
  { name: '명동', areaCode: 'POI003', lat: 37.5636, lng: 126.9869, category: '쇼핑' },
  { name: '광화문', areaCode: 'POI004', lat: 37.5759, lng: 126.9769, category: '문화' },
  { name: '여의도', areaCode: 'POI005', lat: 37.5219, lng: 126.9245, category: '업무' },
  { name: '잠실', areaCode: 'POI006', lat: 37.5133, lng: 127.1000, category: '복합' },
  { name: '신촌', areaCode: 'POI007', lat: 37.5596, lng: 126.9423, category: '문화' },
  { name: '이태원', areaCode: 'POI008', lat: 37.5347, lng: 126.9944, category: '문화' },
  { name: '종로', areaCode: 'POI009', lat: 37.5730, lng: 126.9794, category: '역사' },
  { name: '동대문', areaCode: 'POI010', lat: 37.5712, lng: 127.0098, category: '쇼핑' },
  { name: '건대입구', areaCode: 'POI011', lat: 37.5404, lng: 127.0694, category: '문화' },
  { name: '신림', areaCode: 'POI012', lat: 37.4842, lng: 126.9295, category: '주거' },
  { name: '강남구청역', areaCode: 'POI013', lat: 37.5172, lng: 127.0449, category: '업무' },
  { name: '서울역', areaCode: 'POI014', lat: 37.5563, lng: 126.9723, category: '교통' },
  { name: '삼성역', areaCode: 'POI015', lat: 37.5088, lng: 127.0633, category: '업무' },
  { name: '선릉', areaCode: 'POI016', lat: 37.5047, lng: 127.0490, category: '업무' },
  { name: '압구정', areaCode: 'POI017', lat: 37.5271, lng: 127.0286, category: '쇼핑' },
  { name: '청담', areaCode: 'POI018', lat: 37.5208, lng: 127.0470, category: '문화' },
  { name: '합정', areaCode: 'POI019', lat: 37.5497, lng: 126.9142, category: '문화' },
  { name: '망원', areaCode: 'POI020', lat: 37.5556, lng: 126.9027, category: '문화' },
  { name: '강북', areaCode: 'POI021', lat: 37.6396, lng: 127.0255, category: '주거' },
  { name: '노원', areaCode: 'POI022', lat: 37.6543, lng: 127.0568, category: '주거' },
  { name: '마포', areaCode: 'POI023', lat: 37.5518, lng: 126.9108, category: '업무' },
  { name: '성수', areaCode: 'POI024', lat: 37.5443, lng: 127.0558, category: '문화' },
  { name: '왕십리', areaCode: 'POI025', lat: 37.5614, lng: 127.0368, category: '교통' },
  { name: '뚝섬', areaCode: 'POI026', lat: 37.5483, lng: 127.0436, category: '여가' },
  { name: '용산', areaCode: 'POI027', lat: 37.5326, lng: 126.9649, category: '복합' },
  { name: '영등포', areaCode: 'POI028', lat: 37.5258, lng: 126.8967, category: '업무' },
  { name: '목동', areaCode: 'POI029', lat: 37.5269, lng: 126.8742, category: '주거' },
  { name: '신도림', areaCode: 'POI030', lat: 37.5087, lng: 126.8913, category: '교통' },
  { name: '구로디지털단지', areaCode: 'POI031', lat: 37.4853, lng: 126.9014, category: '업무' },
  { name: '대학로', areaCode: 'POI032', lat: 37.5826, lng: 127.0019, category: '문화' },
  { name: '인사동', areaCode: 'POI033', lat: 37.5745, lng: 126.9855, category: '문화' },
  { name: '북촌', areaCode: 'POI034', lat: 37.5811, lng: 126.9845, category: '역사' },
  { name: '서촌', areaCode: 'POI035', lat: 37.5791, lng: 126.9691, category: '문화' },
  { name: '창경궁', areaCode: 'POI036', lat: 37.5778, lng: 127.0048, category: '역사' },
  { name: '경복궁', areaCode: 'POI037', lat: 37.5796, lng: 126.9770, category: '역사' },
  { name: '북한산', areaCode: 'POI038', lat: 37.6593, lng: 126.9779, category: '자연' },
  { name: '남산', areaCode: 'POI039', lat: 37.5512, lng: 126.9882, category: '자연' },
  { name: '한강공원(반포)', areaCode: 'POI040', lat: 37.5113, lng: 126.9982, category: '자연' },
];

export async function seedSeoulHotspots(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(LocationEntity);
  for (const hotspot of HOTSPOTS) {
    const existing = await repo.findOne({
      where: { areaCode: hotspot.areaCode },
    });
    if (!existing) {
      await repo.save(repo.create(hotspot));
    }
  }
  console.log(`Seeded ${HOTSPOTS.length} Seoul hotspots`);
}
