import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { Cafeteria, Recorrido, Parada } from '../types';
import { optimizarRecorrido, abrirNavegacion } from '../lib/routing';
import { useGeolocation } from '../hooks/useGeolocation';

type Etapa = 'seleccion' | 'enRecorrido';

export function RecorridoPage() {
  const cafeterias = useLiveQuery(() => db.cafeterias.toArray()) ?? [];
  const [seleccionadas, setSeleccionadas] = useState<Set<number>>(new Set());
  const [recorrido, setRecorrido] = useState<Recorrido | null>(null);
  const [etapa, setEtapa] = useState<Etapa>('seleccion');
  const { coordenada, error: gpsError, cargando: gpsCargando } = useGeolocation();

  const toggleSeleccion = (id: number) => {
    setSeleccionadas(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleTodas = () => {
    if (seleccionadas.size === cafeterias.length) {
      setSeleccionadas(new Set());
    } else {
      setSeleccionadas(new Set(cafeterias.map(c => c.id!)));
    }
  };

  const handleIniciarRecorrido = useCallback(() => {
    if (!coordenada || seleccionadas.size === 0) return;

    const elegidas = cafeterias.filter(c => seleccionadas.has(c.id!));
    const ordenadas = optimizarRecorrido(coordenada, elegidas);

    const paradas: Parada[] = ordenadas.map((c, i) => ({
      cafeteriaId: c.id!,
      orden: i,
      visitada: false,
    }));

    const nuevoRecorrido: Recorrido = {
      fecha: new Date(),
      paradas,
      completado: false,
      iniciadoEn: new Date(),
    };

    setRecorrido(nuevoRecorrido);
    setEtapa('enRecorrido');

    // Abrir Maps a la primera parada
    const primera = ordenadas[0];
    abrirNavegacion({ lat: primera.lat, lng: primera.lng });
  }, [coordenada, seleccionadas, cafeterias]);

  const handleEntregado = useCallback(() => {
    if (!recorrido) return;

    const paradaActualIdx = recorrido.paradas.findIndex(p => !p.visitada);
    if (paradaActualIdx === -1) return;

    const paradasActualizadas = recorrido.paradas.map((p, i) =>
      i === paradaActualIdx ? { ...p, visitada: true, visitadaEn: new Date() } : p
    );

    const siguienteIdx = paradasActualizadas.findIndex(p => !p.visitada);

    if (siguienteIdx === -1) {
      setRecorrido({ ...recorrido, paradas: paradasActualizadas, completado: true, finalizadoEn: new Date() });
    } else {
      setRecorrido({ ...recorrido, paradas: paradasActualizadas });
      const siguienteCafe = cafeterias.find(
        c => c.id === paradasActualizadas[siguienteIdx].cafeteriaId
      );
      if (siguienteCafe) {
        abrirNavegacion({ lat: siguienteCafe.lat, lng: siguienteCafe.lng });
      }
    }
  }, [recorrido, cafeterias]);

  const handleReiniciar = () => {
    setRecorrido(null);
    setSeleccionadas(new Set());
    setEtapa('seleccion');
  };

  const getCafeteria = (id: number): Cafeteria | undefined =>
    cafeterias.find(c => c.id === id);

  const paradaActualIdx = recorrido ? recorrido.paradas.findIndex(p => !p.visitada) : -1;

  // ── ETAPA: SELECCIÓN ──
  if (etapa === 'seleccion') {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Nuevo recorrido</h1>
          {cafeterias.length > 0 && (
            <button className="btn-secondary btn-sm" onClick={toggleTodas}>
              {seleccionadas.size === cafeterias.length ? 'Ninguna' : 'Todas'}
            </button>
          )}
        </div>

        {gpsCargando && (
          <div className="info-banner">📍 Obteniendo ubicación...</div>
        )}
        {gpsError && (
          <div className="info-banner error">⚠️ {gpsError}</div>
        )}

        {cafeterias.length === 0 ? (
          <p className="empty">Primero agregá cafeterías en la pestaña ☕</p>
        ) : (
          <>
            <div className="lista">
              {cafeterias.map(c => (
                <div
                  key={c.id}
                  className={`card seleccion-card ${seleccionadas.has(c.id!) ? 'seleccionada' : ''}`}
                  onClick={() => toggleSeleccion(c.id!)}
                >
                  <div className="seleccion-check">
                    {seleccionadas.has(c.id!) ? '✓' : '○'}
                  </div>
                  <div className="cafeteria-info">
                    <strong>{c.nombre}</strong>
                    <span>{c.direccion}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="iniciar-footer">
              <button
                className="btn-primary btn-full"
                disabled={seleccionadas.size === 0 || !coordenada}
                onClick={handleIniciarRecorrido}
              >
                🚀 Iniciar recorrido ({seleccionadas.size} paradas)
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── ETAPA: EN RECORRIDO ──
  if (!recorrido) return null;

  if (recorrido.completado) {
    const visitadas = recorrido.paradas.filter(p => p.visitada).length;
    return (
      <div className="page">
        <div className="completado-container">
          <div className="completado-emoji">🎉</div>
          <h2 className="completado-titulo">¡Recorrido completado!</h2>
          <p className="completado-subtitulo">
            Visitaste {visitadas} cafetería{visitadas !== 1 ? 's' : ''} hoy
          </p>
          <button className="btn-primary btn-full" onClick={handleReiniciar}>
            Nuevo recorrido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>En recorrido</h1>
        <button className="btn-secondary btn-sm" onClick={handleReiniciar}>
          Cancelar
        </button>
      </div>

      {/* Parada actual */}
      {paradaActualIdx !== -1 && (() => {
        const paradaActual = recorrido.paradas[paradaActualIdx];
        const cafe = getCafeteria(paradaActual.cafeteriaId);
        if (!cafe) return null;
        return (
          <div className="card parada-actual">
            <div className="parada-badge">Próxima parada</div>
            <h2 className="parada-nombre">{cafe.nombre}</h2>
            <p className="parada-direccion">{cafe.direccion}</p>
            {cafe.notas && <p className="parada-notas">{cafe.notas}</p>}
            <div className="parada-actions">
              <button
                className="btn-maps"
                onClick={() => abrirNavegacion({ lat: cafe.lat, lng: cafe.lng })}
              >
                📍 Abrir en Maps
              </button>
              <button className="btn-primary btn-full" onClick={handleEntregado}>
                ✓ Entregado
              </button>
            </div>
          </div>
        );
      })()}

      {/* Lista de paradas */}
      <div className="lista paradas-lista">
        {recorrido.paradas.map((parada, i) => {
          const cafe = getCafeteria(parada.cafeteriaId);
          if (!cafe) return null;
          const esActual = i === paradaActualIdx;
          return (
            <div
              key={parada.cafeteriaId}
              className={`card parada-item ${parada.visitada ? 'visitada' : ''} ${esActual ? 'actual' : ''}`}
            >
              <div className="parada-numero">{i + 1}</div>
              <div className="cafeteria-info">
                <strong>{cafe.nombre}</strong>
                <span>{cafe.direccion}</span>
              </div>
              <div className="parada-estado">
                {parada.visitada ? '✓' : esActual ? '→' : '○'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
