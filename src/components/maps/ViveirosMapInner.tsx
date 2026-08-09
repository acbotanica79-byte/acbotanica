"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { viveiros } from "@/lib/data/viveiros";

const icon = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = L.divIcon({
  className: "",
  html: '<div style="width:16px;height:16px;border-radius:999px;background:#c77d4a;border:3px solid white;box-shadow:0 0 0 2px #c77d4a55"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 7, { duration: 1 });
  }, [lat, lng, map]);
  return null;
}

export default function ViveirosMapInner({
  userLocation,
}: {
  userLocation: { lat: number; lng: number } | null;
}) {
  return (
    <MapContainer
      center={[-22.9, -44.5]}
      zoom={6}
      scrollWheelZoom={false}
      className="h-72 w-full rounded-2xl sm:h-96"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {viveiros.map((v) => (
        <Marker key={v.id} position={[v.lat, v.lng]} icon={icon}>
          <Popup>
            <strong>{v.name}</strong>
            <br />
            {v.city}
            <br />
            <span style={{ color: "#2d6a4f" }}>{v.specialty}</span>
          </Popup>
        </Marker>
      ))}
      {userLocation && (
        <>
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>Você está aqui</Popup>
          </Marker>
          <FlyTo lat={userLocation.lat} lng={userLocation.lng} />
        </>
      )}
    </MapContainer>
  );
}
