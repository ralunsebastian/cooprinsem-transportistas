import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpresaTransportista } from '../../database/entities/empresa-transportista.entity';
import { Incidencia } from '../../database/entities/incidencia.entity';
import { RegistroIngreso } from '../../database/entities/registro-ingreso.entity';
import { CreateEmpresaDto, UpdateEmpresaDto } from './dto/empresa.dto';

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(EmpresaTransportista)
    private readonly repo: Repository<EmpresaTransportista>,
    @InjectRepository(RegistroIngreso)
    private readonly registrosRepo: Repository<RegistroIngreso>,
    @InjectRepository(Incidencia)
    private readonly incidenciasRepo: Repository<Incidencia>,
  ) {}

  findAll() {
    return this.repo.find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: number) {
    const empresa = await this.repo.findOne({ where: { id } });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');
    return empresa;
  }

  /** Ficha con historial de ingresos e incidencias (trazabilidad CPHS). */
  async ficha(id: number) {
    const empresa = await this.findOne(id);
    const [registros, incidencias] = await Promise.all([
      this.registrosRepo.find({
        where: { empresaId: id },
        relations: ['conductor', 'motivo', 'areaResponsable'],
        order: { fecha: 'DESC', horaIngreso: 'DESC' },
        take: 100,
      }),
      this.incidenciasRepo.find({
        where: { empresaId: id },
        relations: ['conductor', 'tipo'],
        order: { fecha: 'DESC' },
      }),
    ]);
    return { empresa, registros, incidencias };
  }

  async create(dto: CreateEmpresaDto) {
    const existente = await this.repo.findOne({ where: { nombre: dto.nombre } });
    if (existente) throw new ConflictException('Ya existe una empresa con ese nombre');
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: UpdateEmpresaDto) {
    const empresa = await this.findOne(id);
    Object.assign(empresa, dto);
    return this.repo.save(empresa);
  }
}
