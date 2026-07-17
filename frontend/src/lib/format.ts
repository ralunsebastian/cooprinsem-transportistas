import type { EstadoAviso, Severidad } from './types';

export function formatFecha(fecha: string | null | undefined): string {
  if (!fecha) return '—';
  const [anio, mes, dia] = fecha.slice(0, 10).split('-');
  return `${dia}-${mes}-${anio}`;
}

export function hoyISO(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
}

export function horaAhora(): string {
  const hoy = new Date();
  return `${String(hoy.getHours()).padStart(2, '0')}:${String(hoy.getMinutes()).padStart(2, '0')}`;
}

export const ESTADO_AVISO: Record<EstadoAviso, { label: string; badge: string }> = {
  pendiente: { label: 'Pendiente', badge: 'bg-amber-100 text-amber-800' },
  arribado: { label: 'Arribado', badge: 'bg-emerald-100 text-emerald-800' },
  no_presentado: { label: 'No presentado', badge: 'bg-rose-100 text-rose-800' },
  cancelado: { label: 'Cancelado', badge: 'bg-gray-200 text-gray-600' },
};

export const SEVERIDAD: Record<Severidad, { label: string; badge: string }> = {
  leve: { label: 'Leve', badge: 'bg-amber-100 text-amber-800' },
  grave: { label: 'Grave', badge: 'bg-red-100 text-red-700' },
};

export const ROL_LABEL: Record<string, string> = {
  admin: 'Administrador',
  porteria: 'Portería / Patio',
  solicitante: 'Solicitante (Bodega/Abastecimiento)',
};
