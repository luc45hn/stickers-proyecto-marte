import { useEffect, useRef } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface Props {
  onSelect: (result: { direccion: string; lat: number; lng: number; nombre: string }) => void;
  placeholder?: string;
}

export function PlacesAutocomplete({ onSelect, placeholder = 'Buscar cafetería...' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!places || !inputRef.current) return;

    autocompleteRef.current = new places.Autocomplete(inputRef.current, {
      fields: ['name', 'formatted_address', 'geometry'],
      componentRestrictions: { country: 'ar' },
      types: ['establishment'],
    });

    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (!place || !place.geometry?.location) return;

      onSelect({
        nombre: place.name ?? '',
        direccion: place.formatted_address ?? '',
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });

      if (inputRef.current) inputRef.current.value = '';
    });

    return () => {
      window.google?.maps?.event?.removeListener(listener);
    };
  }, [places]);

  return (
    <input
      ref={inputRef}
      placeholder={placeholder}
      className="places-input"
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.preventDefault();
      }}
    />
  );
}
