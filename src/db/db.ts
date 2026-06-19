import Dexie, { type EntityTable } from 'dexie';
import type { Cafeteria, Recorrido } from '../types';

const db = new Dexie('StickersProyectoMarte') as Dexie & {
  cafeterias: EntityTable<Cafeteria, 'id'>;
  recorridos: EntityTable<Recorrido, 'id'>;
};

db.version(1).stores({
  cafeterias: '++id, nombre, activa, creadaEn',
  recorridos: '++id, fecha, completado',
});

export { db };
