import { useState, useEffect } from 'react';
import type { Coordenada } from '../lib/routing';

interface GeolocationState {
  coordenada: Coordenada | null;
  error: string | null;
  cargando: boolean;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    coordenada: null,
    error: null,
    cargando: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ coordenada: null, error: 'GPS no disponible en este dispositivo', cargando: false });
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        setState({
          coordenada: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          error: null,
          cargando: false,
        });
      },
      (err) => {
        setState({ coordenada: null, error: err.message, cargando: false });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  return state;
}
