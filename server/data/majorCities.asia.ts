// Major cities in Asia with confirmed IATA codes and hotel availability
export const AsiaMajorCities = {
  // Japan
  JP: [
    { name: "Tokyo", iata: "NRT", lat: 35.6762, lon: 139.6503 },
    { name: "Osaka", iata: "KIX", lat: 34.6937, lon: 135.5023 },
    { name: "Kyoto", iata: "KIX", lat: 35.0116, lon: 135.7681 }, // Uses Kansai
  ],
  
  // South Korea
  KR: [
    { name: "Seoul", iata: "ICN", lat: 37.5665, lon: 126.9780 },
    { name: "Busan", iata: "PUS", lat: 35.1796, lon: 129.0756 },
  ],
  
  // China
  CN: [
    { name: "Beijing", iata: "PEK", lat: 39.9042, lon: 116.4074 },
    { name: "Shanghai", iata: "PVG", lat: 31.2304, lon: 121.4737 },
    { name: "Hong Kong", iata: "HKG", lat: 22.3193, lon: 114.1694 },
    { name: "Guangzhou", iata: "CAN", lat: 23.1291, lon: 113.2644 },
    { name: "Shenzhen", iata: "SZX", lat: 22.5429, lon: 114.0596 },
    { name: "Chengdu", iata: "CTU", lat: 30.5728, lon: 104.0668 },
    { name: "Xi'an", iata: "XIY", lat: 34.3416, lon: 108.9398 },
    { name: "Hangzhou", iata: "HGH", lat: 30.2741, lon: 120.1551 },
    { name: "Chongqing", iata: "CKG", lat: 29.4316, lon: 106.9123 },
    { name: "Nanjing", iata: "NKG", lat: 32.0603, lon: 118.7969 },
    { name: "Tianjin", iata: "TSN", lat: 39.3434, lon: 117.3616 },
  ],
  
  // Thailand
  TH: [
    { name: "Bangkok", iata: "BKK", lat: 13.7563, lon: 100.5018 },
    { name: "Chiang Mai", iata: "CNX", lat: 18.7883, lon: 98.9853 },
    { name: "Phuket", iata: "HKT", lat: 7.8804, lon: 98.3923 },
  ],
  
  // Singapore
  SG: [
    { name: "Singapore", iata: "SIN", lat: 1.3521, lon: 103.8198 },
  ],
  
  // Malaysia
  MY: [
    { name: "Kuala Lumpur", iata: "KUL", lat: 3.1390, lon: 101.6869 },
    { name: "Penang", iata: "PEN", lat: 5.4164, lon: 100.3327 },
  ],
  
  // Vietnam
  VN: [
    { name: "Ho Chi Minh City", iata: "SGN", lat: 10.8231, lon: 106.6297 },
    { name: "Hanoi", iata: "HAN", lat: 21.0285, lon: 105.8542 },
  ],
  
  // Indonesia
  ID: [
    { name: "Jakarta", iata: "CGK", lat: -6.2088, lon: 106.8456 },
    { name: "Bali", iata: "DPS", lat: -8.7467, lon: 115.1667 },
  ],
  
  // Philippines
  PH: [
    { name: "Manila", iata: "MNL", lat: 14.5995, lon: 120.9842 },
    { name: "Cebu", iata: "CEB", lat: 10.3157, lon: 123.8854 },
  ],
  
  // India
  IN: [
    { name: "Mumbai", iata: "BOM", lat: 19.0760, lon: 72.8777 },
    { name: "Delhi", iata: "DEL", lat: 28.7041, lon: 77.1025 },
    { name: "Bangalore", iata: "BLR", lat: 12.9716, lon: 77.5946 },
    { name: "Chennai", iata: "MAA", lat: 13.0827, lon: 80.2707 },
  ],
  
  // UAE
  AE: [
    { name: "Dubai", iata: "DXB", lat: 25.2048, lon: 55.2708 },
    { name: "Abu Dhabi", iata: "AUH", lat: 24.4539, lon: 54.3773 },
  ],
  
  // Qatar
  QA: [
    { name: "Doha", iata: "DOH", lat: 25.2854, lon: 51.5310 },
  ],
  
  // Taiwan
  TW: [
    { name: "Taipei", iata: "TPE", lat: 25.0330, lon: 121.5654 },
  ],
  
  // Sri Lanka
  LK: [
    { name: "Colombo", iata: "CMB", lat: 6.9271, lon: 79.8612 },
  ],
  
  // Maldives
  MV: [
    { name: "Malé", iata: "MLE", lat: 4.1755, lon: 73.5093 },
  ],
} as const;

export type AsiaCountryCode = keyof typeof AsiaMajorCities;
export type AsiaCityInfo = typeof AsiaMajorCities[AsiaCountryCode][number];