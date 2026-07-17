import { CategoriaCatalogo } from '../../common/enums';

export const ADMIN_DEFAULT = {
  email: 'admin@cooprinsem.cl',
  nombre: 'Administrador',
  password: 'admin123',
};

export const USUARIOS_DEMO = [
  { email: 'porteria@cooprinsem.cl', nombre: 'Portería Patio', rol: 'porteria', password: 'porteria123' },
  { email: 'bodega@cooprinsem.cl', nombre: 'Bodega Solicitante', rol: 'solicitante', password: 'bodega123' },
] as const;

export const OPCIONES_CATALOGO: Record<CategoriaCatalogo, string[]> = {
  [CategoriaCatalogo.MOTIVO_VISITA]: [
    'Descarga de productos',
    'Carga / retiro de productos',
    'Retiro de insumos',
    'Descarga de Nitrógeno (INDURA)',
    'Retiro de residuos',
    'Otro',
  ],
  [CategoriaCatalogo.AREA_RESPONSABLE]: [
    'Bodega',
    'Patio',
    'Abastecimiento',
    'Administración',
    'Ferretería',
  ],
  [CategoriaCatalogo.TIPO_INCIDENCIA]: [
    'Ingreso sin aviso previo',
    'Sin EPP',
    'Exceso de velocidad',
    'Descarga sin supervisión',
    'Estacionamiento indebido',
    'Maniobra riesgosa',
    'Conductor no apto',
    'Otro',
  ],
};

export const EMPRESAS_DEMO = [{ nombre: 'INDURA', rut: null, contacto: null, telefono: null }];
