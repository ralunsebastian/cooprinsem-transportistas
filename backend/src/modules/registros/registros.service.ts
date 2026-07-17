import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Like, Repository } from 'typeorm';
import { EstadoAviso } from '../../common/enums';
import { AvisoCamion } from '../../database/entities/aviso-camion.entity';
import { RegistroIngreso } from '../../database/entities/registro-ingreso.entity';
import { CreateRegistroDto, FiltrosRegistrosDto, RegistrarSalidaDto } from './dto/registro.dto';

const RELACIONES = [
  'conductor',
  'empresa',
  'motivo',
  'areaResponsable',
  'aviso',
  'creadoPor',
  'salidaAutorizadaPor',
];

@Injectable()
export class RegistrosService {
  constructor(
    @InjectRepository(RegistroIngreso)
    private readonly repo: Repository<RegistroIngreso>,
    @InjectRepository(AvisoCamion)
    private readonly avisosRepo: Repository<AvisoCamion>,
  ) {}

  async findAll(filtros: FiltrosRegistrosDto) {
    const where: FindOptionsWhere<RegistroIngreso> = {};
    if (filtros.empresaId) where.empresaId = filtros.empresaId;
    if (filtros.patente) where.patente = Like(`%${filtros.patente}%`);
    if (filtros.dentro) where.horaSalida = IsNull();

    const qb = this.repo
      .createQueryBuilder('r')
      .setFindOptions({ where, relations: RELACIONES })
      .orderBy('r.fecha', 'DESC')
      .addOrderBy('r.horaIngreso', 'DESC')
      .take(500);
    if (filtros.desde) qb.andWhere('r.fecha >= :desde', { desde: filtros.desde });
    if (filtros.hasta) qb.andWhere('r.fecha <= :hasta', { hasta: filtros.hasta });
    return qb.getMany();
  }

  async findOne(id: number) {
    const registro = await this.repo.findOne({ where: { id }, relations: RELACIONES });
    if (!registro) throw new NotFoundException('Registro no encontrado');
    return registro;
  }

  async create(dto: CreateRegistroDto, userId: number) {
    const registro = this.repo.create({
      ...dto,
      patente: dto.patente.toUpperCase().trim(),
      creadoPorUserId: userId,
    });
    const guardado = await this.repo.save(registro);

    if (dto.avisoId) {
      await this.avisosRepo.update({ id: dto.avisoId }, { estado: EstadoAviso.ARRIBADO });
    }
    return this.findOne(guardado.id);
  }

  async registrarSalida(id: number, dto: RegistrarSalidaDto, userId: number) {
    const registro = await this.findOne(id);
    if (registro.horaSalida) {
      throw new BadRequestException('Este registro ya tiene salida registrada');
    }
    registro.horaSalida = dto.horaSalida;
    registro.salidaAutorizadaPorUserId = userId;
    if (dto.observaciones) {
      registro.observaciones = registro.observaciones
        ? `${registro.observaciones}\nSalida: ${dto.observaciones}`
        : dto.observaciones;
    }
    await this.repo.save(registro);
    return this.findOne(id);
  }
}
