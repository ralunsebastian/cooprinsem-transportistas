import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoAviso } from '../../common/enums';
import { AvisoCamion } from '../../database/entities/aviso-camion.entity';
import { CambiarEstadoAvisoDto, CreateAvisoDto, UpdateAvisoDto } from './dto/aviso.dto';

const RELACIONES = ['empresa', 'conductor', 'motivo', 'areaResponsable', 'creadoPor'];

@Injectable()
export class AvisosService {
  constructor(
    @InjectRepository(AvisoCamion) private readonly repo: Repository<AvisoCamion>,
  ) {}

  findAll(desde?: string, hasta?: string, estado?: EstadoAviso) {
    const qb = this.repo
      .createQueryBuilder('a')
      .setFindOptions({ relations: RELACIONES })
      .orderBy('a.fechaEstimada', 'DESC')
      .addOrderBy('a.horaEstimada', 'ASC')
      .take(500);
    if (desde) qb.andWhere('a.fechaEstimada >= :desde', { desde });
    if (hasta) qb.andWhere('a.fechaEstimada <= :hasta', { hasta });
    if (estado) qb.andWhere('a.estado = :estado', { estado });
    return qb.getMany();
  }

  /** Avisos pendientes de hoy (lo que portería ve al llegar un camión). */
  hoy() {
    const hoy = new Date().toISOString().slice(0, 10);
    return this.repo.find({
      where: { fechaEstimada: hoy, estado: EstadoAviso.PENDIENTE },
      relations: RELACIONES,
      order: { horaEstimada: 'ASC' },
    });
  }

  async findOne(id: number) {
    const aviso = await this.repo.findOne({ where: { id }, relations: RELACIONES });
    if (!aviso) throw new NotFoundException('Aviso no encontrado');
    return aviso;
  }

  async create(dto: CreateAvisoDto, userId: number) {
    const aviso = this.repo.create({
      ...dto,
      patente: dto.patente?.toUpperCase().trim(),
      creadoPorUserId: userId,
    });
    const guardado = await this.repo.save(aviso);
    return this.findOne(guardado.id);
  }

  async update(id: number, dto: UpdateAvisoDto) {
    const aviso = await this.findOne(id);
    Object.assign(aviso, dto, dto.patente ? { patente: dto.patente.toUpperCase().trim() } : {});
    await this.repo.save(aviso);
    return this.findOne(id);
  }

  async cambiarEstado(id: number, dto: CambiarEstadoAvisoDto) {
    const aviso = await this.findOne(id);
    aviso.estado = dto.estado;
    await this.repo.save(aviso);
    return this.findOne(id);
  }
}
