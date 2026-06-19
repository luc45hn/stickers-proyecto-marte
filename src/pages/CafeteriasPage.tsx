import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { Cafeteria } from '../types';
import { PlacesAutocomplete } from '../components/cafeterias/PlacesAutocomplete';

interface FormState {
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  notas: string;
}

const EMPTY_FORM: FormState = {
  nombre: '',
  direccion: '',
  lat: 0,
  lng: 0,
  notas: '',
};

export function CafeteriasPage() {
  const cafeterias = useLiveQuery(() => db.cafeterias.orderBy('nombre').toArray()) ?? [];
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditandoId(null);
    setMostrarForm(false);
  };

  const handlePlaceSelect = useCallback((result: { direccion: string; lat: number; lng: number; nombre: string }) => {
    setForm(f => ({
      ...f,
      nombre: result.nombre,
      direccion: result.direccion,
      lat: result.lat,
      lng: result.lng,
    }));
  }, []);

  const handleGuardar = async () => {
    if (!form.nombre || !form.direccion || !form.lat || !form.lng) return;
    if (editandoId !== null) {
      await db.cafeterias.update(editandoId, { ...form });
    } else {
      await db.cafeterias.add({ ...form, activa: true, creadaEn: new Date() });
    }
    resetForm();
  };

  const handleEditar = (c: Cafeteria) => {
    setForm({
      nombre: c.nombre,
      direccion: c.direccion,
      lat: c.lat,
      lng: c.lng,
      notas: c.notas ?? '',
    });
    setEditandoId(c.id!);
    setMostrarForm(true);
  };

  const handleEliminar = async (id: number) => {
    if (confirm('¿Eliminar esta cafetería?')) await db.cafeterias.delete(id);
  };

  const handleToggleActiva = async (c: Cafeteria) => {
    await db.cafeterias.update(c.id!, { activa: !c.activa });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Cafeterías</h1>
        <button className="btn-primary" onClick={() => setMostrarForm(true)}>+ Agregar</button>
      </div>

      {mostrarForm && (
        <div className="card form-card">
          <h2>{editandoId ? 'Editar cafetería' : 'Nueva cafetería'}</h2>

          {!editandoId && (
            <PlacesAutocomplete onSelect={handlePlaceSelect} />
          )}

          {form.nombre && (
            <div className="place-preview">
              <strong>{form.nombre}</strong>
              <span>{form.direccion}</span>
            </div>
          )}

          <input
            placeholder="Notas (opcional)"
            value={form.notas}
            onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
          />

          <div className="form-actions">
            <button className="btn-secondary" onClick={resetForm}>Cancelar</button>
            <button
              className="btn-primary"
              onClick={handleGuardar}
              disabled={!form.nombre || !form.lat}
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      <div className="lista">
        {cafeterias.length === 0 && (
          <p className="empty">No hay cafeterías cargadas todavía.</p>
        )}
        {cafeterias.map(c => (
          <div key={c.id} className={`card cafeteria-card ${!c.activa ? 'inactiva' : ''}`}>
            <div className="cafeteria-info">
              <strong>{c.nombre}</strong>
              <span>{c.direccion}</span>
              {c.notas && <span className="notas">{c.notas}</span>}
            </div>
            <div className="cafeteria-actions">
              <button
                className={`btn-toggle ${c.activa ? 'activa' : ''}`}
                onClick={() => handleToggleActiva(c)}
                title={c.activa ? 'Activa' : 'Inactiva'}
              >
                {c.activa ? '✓' : '○'}
              </button>
              <button className="btn-icon" onClick={() => handleEditar(c)}>✏️</button>
              <button className="btn-icon" onClick={() => handleEliminar(c.id!)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
