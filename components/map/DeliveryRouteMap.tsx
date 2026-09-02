"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";

// Custom Leaflet Icons for Waypoints
const createCustomDivIcon = (emoji: string, bgClass: string, label: string) => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div class="relative flex flex-col items-center group">
        <div class="w-10 h-10 rounded-full ${bgClass} border-2 border-white shadow-lg flex items-center justify-center text-xl transition-transform hover:scale-110">
          ${emoji}
        </div>
        <div class="mt-1 bg-gray-900/90 text-white text-[10px] font-poppins font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
          ${label}
        </div>
      </div>
    `,
    iconSize: [40, 56],
    iconAnchor: [20, 50],
    popupAnchor: [0, -45],
  });
};

const storeIcon = createCustomDivIcon("🏪", "bg-amber-500 text-white", "Pick-up (Store)");
const riderIcon = createCustomDivIcon("🛵", "bg-blue-600 text-white", "Rider (On Way)");
const customerIcon = createCustomDivIcon("📍", "bg-emerald-600 text-white", "Delivery (Customer)");

export interface DeliveryRouteMapProps {
  restaurantLat: number;
  restaurantLng: number;
  restaurantName: string;
  restaurantAddress?: string;
  customerLat: number;
  customerLng: number;
  customerAddress?: string;
  riderLat?: number;
  riderLng?: number;
  riderName?: string;
  status?: string;
}

function BoundsController({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [map, points]);

  return null;
}

export default function DeliveryRouteMap({
  restaurantLat,
  restaurantLng,
  restaurantName,
  restaurantAddress = "Restaurant Store Location",
  customerLat,
  customerLng,
  customerAddress = "Customer Delivery Address",
  riderLat,
  riderLng,
  riderName = "Assigned Rider",
  status = "preparing",
}: DeliveryRouteMapProps) {
  // Safe lat/lng fallbacks
  const originPos: [number, number] = [
    Number(restaurantLat) || 31.5204,
    Number(restaurantLng) || 74.3587,
  ];

  const destPos: [number, number] = [
    Number(customerLat) || 31.5497,
    Number(customerLng) || 74.3436,
  ];

  // Rider position waypoint: if live rider lat/lng provided use it, else interpolate midpoint
  const currentRiderLat = riderLat || (originPos[0] + 0.45 * (destPos[0] - originPos[0]));
  const currentRiderLng = riderLng || (originPos[1] + 0.45 * (destPos[1] - originPos[1]));
  const riderPos: [number, number] = [currentRiderLat, currentRiderLng];

  // Route path waypoints: Store -> Rider -> Customer
  const routePoints: [number, number][] = [originPos, riderPos, destPos];

  // Google Maps Direct Direction URLs (exact matching Leaflet coordinates)
  const googleMapsStoreUrl = `https://www.google.com/maps/dir/?api=1&destination=${originPos[0]},${originPos[1]}`;
  const googleMapsCustomerUrl = `https://www.google.com/maps/dir/?api=1&destination=${destPos[0]},${destPos[1]}`;
  const googleMapsRouteUrl = `https://www.google.com/maps/dir/?api=1&origin=${originPos[0]},${originPos[1]}&destination=${destPos[0]},${destPos[1]}`;

  return (
    <div className="w-full flex flex-col gap-3 select-none">
      {/* Route Info Banner */}
      <div className="w-full bg-[#2B1B0E] text-white p-3.5 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md font-poppins">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FCBA08] text-[#2B1B0E] flex items-center justify-center font-bold text-lg flex-shrink-0">
            🛵
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-300/80 font-medium">Live Delivery Route</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {status === "delivering" ? "Rider Out for Delivery" : status === "delivered" ? "Delivered" : "Rider Assigned"}
              </span>
            </div>
            <span className="text-sm font-bold text-white truncate max-w-[240px] sm:max-w-[340px]">
              {restaurantName} → Customer Address
            </span>
          </div>
        </div>

        {/* Google Maps Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={googleMapsStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-[#2B1B0E] text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-500/30 transition-all flex items-center gap-1.5"
          >
            <span>🏪</span>
            <span>Nav Store</span>
          </a>

          <a
            href={googleMapsCustomerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-500/30 transition-all flex items-center gap-1.5"
          >
            <span>📍</span>
            <span>Nav Customer</span>
          </a>

          <a
            href={googleMapsRouteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <span>🗺️</span>
            <span>Google Maps Route</span>
          </a>
        </div>
      </div>

      {/* Leaflet Interactive Map Container */}
      <div className="w-full h-[320px] sm:h-[380px] rounded-[22px] overflow-hidden border border-gray-200 shadow-md relative z-10">
        <MapContainer
          center={originPos}
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Auto Fit Map Bounds */}
          <BoundsController points={routePoints} />

          {/* Waypoint 1: Store / Restaurant Marker */}
          <Marker position={originPos} icon={storeIcon}>
            <Popup className="font-poppins text-xs">
              <div className="p-1.5 flex flex-col gap-1.5">
                <strong className="text-[#2B1B0E] text-sm font-bold">🏪 {restaurantName}</strong>
                <span className="text-gray-600 text-xs">{restaurantAddress}</span>
                <a
                  href={googleMapsStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center justify-center gap-1 text-[11px] bg-[#FCBA08] text-[#2B1B0E] font-bold px-2.5 py-1 rounded-md shadow-xs hover:bg-[#e5a807]"
                >
                  🗺️ Navigate Store in Google Maps
                </a>
              </div>
            </Popup>
          </Marker>

          {/* Waypoint 2: Rider Marker */}
          <Marker position={riderPos} icon={riderIcon}>
            <Popup className="font-poppins text-xs">
              <div className="p-1 flex flex-col gap-1">
                <strong className="text-blue-700 text-sm font-bold">🛵 Rider: {riderName}</strong>
                <span className="text-gray-600 text-xs">En route between store & customer</span>
              </div>
            </Popup>
          </Marker>

          {/* Waypoint 3: Customer Marker */}
          <Marker position={destPos} icon={customerIcon}>
            <Popup className="font-poppins text-xs">
              <div className="p-1.5 flex flex-col gap-1.5">
                <strong className="text-emerald-700 text-sm font-bold">📍 Customer Destination</strong>
                <span className="text-gray-600 text-xs">{customerAddress}</span>
                <a
                  href={googleMapsCustomerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center justify-center gap-1 text-[11px] bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-md shadow-xs hover:bg-emerald-700"
                >
                  📍 Navigate Customer in Google Maps
                </a>
              </div>
            </Popup>
          </Marker>

          {/* Route Polyline (Restaurant -> Rider -> Customer) */}
          <Polyline
            positions={routePoints}
            pathOptions={{
              color: "#FCBA08",
              weight: 5,
              opacity: 0.9,
              dashArray: "10, 8",
            }}
          />
        </MapContainer>
      </div>
    </div>
  );
}
