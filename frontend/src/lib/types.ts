export type Rol = 'admin' | 'porteria' | 'solicitante';

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: Rol;
  activo?: boolean;
}

export interface Configuracion {
  clave: string;
  valor: string;
  descripcion: string | null;
}

export type CategoriaCatalogo = 'motivo_visita' | 'area_responsable' | 'tipo_incidencia';

export interface OpcionCatalogo {
  id: number;
  categoria: CategoriaCatalogo;
  nombre: string;
  orden: number;
  activo: boolean;
}

export interface Empresa {
  id: number;
  nombre: string;
  rut: string | null;
  contacto: string | null;
  telefono: string | null;
  activo: boolean;
}

export interface Conductor {
  id: number;
  nombre: string;
  rut: string;
  telefono: string | null;
  empresaId: number | null;
  empresa: Empresa | null;
  activo: boolean;
}

export type EstadoAviso = 'pendiente' | 'arribado' | 'no_presentado' | 'cancelado';

export interface Aviso {
  id: number;
  fechaEstimada: string;
  horaEstimada: string | null;
  empresaId: number | null;
  empresa: Empresa | null;
  conductorId: number | null;
  conductor: Conductor | null;
  patente: string | null;
  tonelaje: number | null;
  motivoId: number | null;
  motivo: OpcionCatalogo | null;
  areaResponsableId: number | null;
  areaResponsable: OpcionCatalogo | null;
  requiereSupervision: boolean;
  estado: EstadoAviso;
  observaciones: string | null;
  creadoPor: Usuario | null;
}

export interface Registro {
  id: number;
  fecha: string;
  horaIngreso: string;
  horaSalida: string | null;
  conductorId: number;
  conductor: Conductor;
  empresaId: number;
  empresa: Empresa;
  patente: string;
  motivoId: number | null;
  motivo: OpcionCatalogo | null;
  areaResponsableId: number | null;
  areaResponsable: OpcionCatalogo | null;
  guiaDespacho: string | null;
  condicionApto: boolean;
  eppVerificado: boolean;
  avisoId: number | null;
  aviso: Aviso | null;
  observaciones: string | null;
  creadoPor: Usuario | null;
  salidaAutorizadaPor: Usuario | null;
}

export type Severidad = 'leve' | 'grave';

export interface Incidencia {
  id: number;
  fecha: string;
  registroIngresoId: number | null;
  empresaId: number;
  empresa: Empresa;
  conductorId: number | null;
  conductor: Conductor | null;
  tipoId: number | null;
  tipo: OpcionCatalogo | null;
  severidad: Severidad;
  descripcion: string;
  creadoPor: Usuario | null;
}

export interface DashboardResumen {
  dentroAhora: number;
  ingresosHoy: number;
  avisosPendientesHoy: number;
  incidenciasMes: number;
  camionesDentro: Registro[];
  avisosHoy: Aviso[];
}

export interface FichaEmpresa {
  empresa: Empresa;
  registros: Registro[];
  incidencias: Incidencia[];
}
