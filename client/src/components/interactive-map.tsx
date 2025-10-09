import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveMapProps {
  city: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  className?: string;
  height?: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  city, 
  coordinates, 
  className = "",
  height = "h-64"
}) => {
  // Default coordinates for major cities if not provided
  const defaultCoordinates: Record<string, { lat: number; lng: number }> = {
    tokyo: { lat: 35.6762, lng: 139.6503 },
    paris: { lat: 48.8566, lng: 2.3522 },
    london: { lat: 51.5074, lng: -0.1278 },
    'new-york': { lat: 40.7128, lng: -74.0060 },
    rome: { lat: 41.9028, lng: 12.4964 },
    barcelona: { lat: 41.3851, lng: 2.1734 },
    amsterdam: { lat: 52.3676, lng: 4.9041 },
    berlin: { lat: 52.5200, lng: 13.4050 },
    prague: { lat: 50.0755, lng: 14.4378 },
    vienna: { lat: 48.2082, lng: 16.3738 },
    budapest: { lat: 47.4979, lng: 19.0402 },
    madrid: { lat: 40.4168, lng: -3.7038 },
    lisbon: { lat: 38.7223, lng: -9.1393 },
    stockholm: { lat: 59.3293, lng: 18.0686 },
    copenhagen: { lat: 55.6761, lng: 12.5683 },
    oslo: { lat: 59.9139, lng: 10.7522 },
    bangkok: { lat: 13.7563, lng: 100.5018 },
    singapore: { lat: 1.3521, lng: 103.8198 },
    hong_kong: { lat: 22.3193, lng: 114.1694 },
    seoul: { lat: 37.5665, lng: 126.9780 },
    dubai: { lat: 25.2048, lng: 55.2708 },
    sydney: { lat: -33.8688, lng: 151.2093 },
    melbourne: { lat: -37.8136, lng: 144.9631 },
    toronto: { lat: 43.6532, lng: -79.3832 },
    vancouver: { lat: 49.2827, lng: -123.1207 },
  };

  // Get coordinates from props or default
  const cityKey = city.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '_');
  const coords = coordinates || defaultCoordinates[cityKey] || defaultCoordinates[city.toLowerCase()] || { lat: 0, lng: 0 };

  if (coords.lat === 0 && coords.lng === 0) {
    return (
      <div className={`${className} ${height} bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center text-gray-600">
          <div className="text-sm">Map not available for {city}</div>
          <div className="text-xs mt-1">Coordinates not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} ${height} rounded-lg overflow-hidden border border-gray-200`}>
      <MapContainer
        center={[coords.lat, coords.lng]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[coords.lat, coords.lng]}>
          <Popup>
            <div className="text-center">
              <div className="font-semibold">{city}</div>
              <div className="text-sm text-gray-600">
                Explore this amazing destination!
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;