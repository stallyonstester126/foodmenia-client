"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";

// Custom Leaflet Pin Icon (fixes missing default marker image path issue in Webpack/Next.js)
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface AddressMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onLocationSelect: (data: LocationData) => void;
}

// Controller component to handle map clicks & position updates
function MapEventsController({
  position,
  setPosition,
  onPositionChange,
}: {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  onPositionChange: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      map.flyTo(newPos, map.getZoom());
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    map.flyTo(position, map.getZoom());
  }, [position, map]);

  return null;
}

export default function AddressMapPicker({
  initialLat = 30.3753,
  initialLng = 69.3451,
  initialAddress = "",
  onLocationSelect,
}: AddressMapPickerProps) {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
  const [address, setAddress] = useState(initialAddress);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const markerRef = useRef<L.Marker>(null);

  // Reverse Geocode (Lat/Lng to Address string via OpenStreetMap Nominatim API)
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      setErrorMsg(null);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const formatted = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setAddress(formatted);
        onLocationSelect({ lat, lng, address: formatted });
      }
    } catch {
      const fallback = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
      setAddress(fallback);
      onLocationSelect({ lat, lng, address: fallback });
    }
  };

  // Search Address via OpenStreetMap Nominatim Search API
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setErrorMsg(null);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
        if (results.length === 0) {
          setErrorMsg("No locations found for this query.");
        }
      }
    } catch {
      setErrorMsg("Failed to search location.");
    } finally {
      setIsSearching(false);
    }
  };

  // Select Search Result
  const handleSelectSearchResult = (res: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(res.lat);
    const lng = parseFloat(res.lon);
    const newPos: [number, number] = [lat, lng];
    setPosition(newPos);
    setAddress(res.display_name);
    setSearchResults([]);
    setSearchQuery("");
    onLocationSelect({ lat, lng, address: res.display_name });
  };

  // Get User Current Location (Browser Geolocation)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const newPos: [number, number] = [lat, lng];
        setPosition(newPos);
        fetchAddress(lat, lng);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        setErrorMsg("Unable to retrieve your location. Please select on map.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Draggable Marker Handlers
  const markerEventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          const newPos: [number, number] = [latLng.lat, latLng.lng];
          setPosition(newPos);
          fetchAddress(latLng.lat, latLng.lng);
        }
      },
    }),
    []
  );

  return (
    <div className="w-full flex flex-col gap-3 font-poppins">
      {/* Search Input Bar */}
      <div className="relative w-full">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search city, street, or landmark..."
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/50 shadow-sm"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-2.5 bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center flex-shrink-0"
            title="Use My Current Location"
          >
            {isLocating ? (
              <span className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              "📍"
            )}
          </button>
        </div>

        {/* Search Results Autocomplete Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-[1000] mt-1 max-h-48 overflow-y-auto bg-white rounded-xl border border-gray-200 shadow-lg flex flex-col divide-y divide-gray-100">
            {searchResults.map((res, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSearchResult(res)}
                className="text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-amber-50 hover:text-[#2B1B0E] transition-colors"
              >
                📍 {res.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Leaflet Map Display */}
      <div className="w-full h-[280px] sm:h-[320px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
        <MapContainer
          center={position}
          zoom={14}
          scrollWheelZoom={true}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            draggable={true}
            eventHandlers={markerEventHandlers}
            position={position}
            ref={markerRef}
            icon={markerIcon}
          />
          <MapEventsController
            position={position}
            setPosition={setPosition}
            onPositionChange={(lat, lng) => fetchAddress(lat, lng)}
          />
        </MapContainer>
      </div>

      {/* Selected Address Display Card */}
      <div className="bg-amber-50 border border-amber-200/70 p-3.5 rounded-xl flex flex-col gap-1">
        <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
          Selected Location:
        </span>
        <span className="text-xs font-semibold text-[#2B1B0E] line-clamp-2">
          {address || "Click on the map or drag the pin to choose an address."}
        </span>
      </div>
    </div>
  );
}
