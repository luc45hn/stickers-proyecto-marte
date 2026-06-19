export interface Cafeteria {
  id?: number;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  notas?: string;
  activa: boolean;
  creadaEn: Date;
}

export interface Parada {
  cafeteriaId: number;
  orden: number;
  visitada: boolean;
  visitadaEn?: Date;
}

export interface Recorrido {
  id?: number;
  fecha: Date;
  paradas: Parada[];
  completado: boolean;
  iniciadoEn?: Date;
  finalizadoEn?: Date;
}
