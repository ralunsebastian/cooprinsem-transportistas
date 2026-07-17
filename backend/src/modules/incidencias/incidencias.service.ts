import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Incidencia } from '../../database/entities/incidencia.entity';
import { CreateIncidenciaDto, UpdateIncidenciaDto } from './dto/incidencia.dto';

const RELACIONES = ['empresa', 'conductor', 'tipo', 'registroIngreso', 'creadoPor'];

@Injectable()
export class IncidenciasService {
  constructor(
    @InjectRepository(Incidencia) private readonly repo: Repository<Incidencia>,
  ) {}

  findAll(empresaId?: number, conductorId?: number) {
    const where: FindOptionsWhere<Incidencia> = {};
    if (empresaId) where.empresaId = empresaId;
    if (conductorId) where.conductorId = conductorId;
    return this.repo.find({
      where,
      relations: RELACIONES,
      order: { fecha: 'DESC', id: 'DESC' },
      take: 500,
    });
  }

  async findOne(id: number) {
    const incidencia = await this.repo.findOne({ where: { id }, relations: RELACIONES });
    if (!incidencia) throw new NotFoundException('Incidencia no encontrada');
    return incidencia;
  }

  async create(dto: CreateIncidenciaDto, userId: number) {
    const guardada = await this.repo.save(
      this.repo.create({ ...dto, creadoPorUserId: userId }),
    );
    return this.findOne(guardada.id);
  }

  async update(id: number, dto: UpdateIncidenciaDto) {
    const incidencia = await this.findOne(id);
    Object.assign(incidencia, dto);
    await this.repo.save(incidencia);
    return this.findOne(id);
  }

  async remove(id: number) {
    const incidencia = await this.findOne(id);
    await this.repo.remove(incidencia);
    return { eliminado: true };
  }
}
