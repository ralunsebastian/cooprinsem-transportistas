import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuracion } from '../../database/entities/configuracion.entity';

export const CONFIG_DEFAULTS: Record<string, { valor: string; descripcion: string }> = {
  'empresa.nombre': {
    valor: 'Cooprinsem',
    descripcion: 'Nombre de la empresa mostrado en la plataforma',
  },
  'sucursal.nombre': {
    valor: 'Sucursal Manuel Rodríguez',
    descripcion: 'Nombre de la sucursal',
  },
  'sucursal.direccion': {
    valor: 'Manuel Rodríguez 1040, Osorno',
    descripcion: 'Dirección de la sucursal',
  },
  'protocolo.epp_obligatorio': {
    valor:
      'Chaleco reflectante o ropa de alta visibilidad; zapatos de seguridad o calzado cerrado antideslizante; casco de seguridad en zonas de carga, descarga, bodega o patio operativo; guantes de seguridad cuando exista manipulación de carga.',
    descripcion: 'Elementos de protección personal obligatorios (texto mostrado en portería)',
  },
  'protocolo.horario_recepcion': {
    valor: '08:30 a 17:30',
    descripcion: 'Horario habitual de recepción de camiones',
  },
};

@Injectable()
export class ConfiguracionService implements OnModuleInit {
  private cache = new Map<string, string>();

  constructor(
    @InjectRepository(Configuracion)
    private readonly repo: Repository<Configuracion>,
  ) {}

  async onModuleInit() {
    // En el primer arranque en el hosting (synchronize off) la tabla aún no
    // existe: SeedService la crea después; mientras, rigen los CONFIG_DEFAULTS.
    try {
      const filas = await this.repo.find();
      this.cache = new Map(filas.map((f) => [f.clave, f.valor]));
    } catch {
      this.cache = new Map();
    }
  }

  async findAll() {
    return this.repo.find({ order: { clave: 'ASC' } });
  }

  async actualizar(clave: string, valor: string) {
    await this.repo.update({ clave }, { valor });
    this.cache.set(clave, valor);
    return this.repo.findOne({ where: { clave } });
  }

  getString(clave: string): string {
    return this.cache.get(clave) ?? CONFIG_DEFAULTS[clave]?.valor ?? '';
  }
}
