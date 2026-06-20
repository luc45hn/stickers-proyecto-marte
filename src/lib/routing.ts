import type { Cafeteria } from '../types';

export interface Coordenada {
  lat: number;
  lng: number;
}

// Distancia en km entre dos coordenadas (Haversine)
export function distanciaKm(a: Coordenada, b: Coordenada): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng * sinLng;
  return R * 2 * Math.asin(Math.sqrt(h));
}

// Nearest-neighbor TSP: dado un punto de partida y una lista de cafeterías,
// devuelve las cafeterías ordenadas por recorrido óptimo greedy
export function optimizarRecorrido(
  origen: Coordenada,
  cafeterias: Cafeteria[]
): Cafeteria[] {
  if (cafeterias.length === 0) return [];

  const pendientes = [...cafeterias];
  const resultado: Cafeteria[] = [];
  let actual: Coordenada = origen;

  while (pendientes.length > 0) {
    let minDist = Infinity;
    let minIdx = 0;

    pendientes.forEach((c, i) => {
      const d = distanciaKm(actual, { lat: c.lat, lng: c.lng });
      if (d < minDist) {
        minDist = d;
        minIdx = i;
      }
    });

    const siguiente = pendientes.splice(minIdx, 1)[0];
    resultado.push(siguiente);
    actual = { lat: siguiente.lat, lng: siguiente.lng };
  }

  return resultado;
}

// Genera el link de Google Maps navegación (web)
export function googleMapsNavLink(destino: Coordenada): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${destino.lat},${destino.lng}&travelmode=driving`;
}

export function abrirNavegacion(destino: Coordenada): void {
  const intentUrl = `intent://maps.google.com/maps?daddr=${destino.lat},${destino.lng}&dirflg=d#Intent;scheme=https;package=com.google.android.apps.maps;end`;
  const webUrl = `https://maps.google.com/maps?daddr=${destino.lat},${destino.lng}&dirflg=d`;

  try {
    window.location.href = intentUrl;
    setTimeout(() => {
      window.open(webUrl, '_blank');
    }, 1500);
  } catch {
    window.open(webUrl, '_blank');
  }
}
