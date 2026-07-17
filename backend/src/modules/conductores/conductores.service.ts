import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Conductor } from '../../database/entities/conductor.entity';
import { CreateConductorDto, UpdateConductorDto } from './dto/conductor.dto';

@Injectable()
export class ConductoresService {
  constructor(@InjectRepository(Conductor) private readonly repo: Repository<Conductor>) {}

  findAll(busqueda?: string) {
    return this.repo.find({
      where: busqueda
        ? [{ rut: Like(`%${busqueda}%`) }, { nombre: Like(`%${busqueda}%`) }]
        : {},
      relations: ['empresa'],
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number) {
    const conductor = await this.repo.findOne({ where: { id }, relations: ['empresa'] });
    if (!conductor) throw new NotFoundException('Conductor no encontrado');
    return conductor;
  }

  async create(dto: CreateConductorDto) {
    const existente = await this.repo.findOne({ where: { rut: dto.rut } });
    if (existente) throw new ConflictException('Ya existe un conductor con ese RUT');
    const guardado = await this.repo.save(this.repo.create(dto));
    return this.findOne(guardado.id);
  }

  async update(id: number, dto: UpdateConductorDto) {
    const conductor = await this.findOne(id);
    Object.assign(conductor, dto);
    await this.repo.save(conductor);
    return this.findOne(id);
  }
}
