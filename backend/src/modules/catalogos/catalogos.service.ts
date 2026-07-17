import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaCatalogo } from '../../common/enums';
import { OpcionCatalogo } from '../../database/entities/opcion-catalogo.entity';

@Injectable()
export class CatalogosService {
  constructor(
    @InjectRepository(OpcionCatalogo) private readonly repo: Repository<OpcionCatalogo>,
  ) {}

  findAll(categoria?: CategoriaCatalogo) {
    return this.repo.find({
      where: categoria ? { categoria } : {},
      order: { categoria: 'ASC', orden: 'ASC', nombre: 'ASC' },
    });
  }

  create(datos: Partial<OpcionCatalogo>) {
    return this.repo.save(this.repo.create(datos));
  }

  async update(id: number, datos: Partial<OpcionCatalogo>) {
    const opcion = await this.repo.findOne({ where: { id } });
    if (!opcion) throw new NotFoundException('Opción no encontrada');
    Object.assign(opcion, datos);
    return this.repo.save(opcion);
  }

  async remove(id: number) {
    const opcion = await this.repo.findOne({ where: { id } });
    if (!opcion) throw new NotFoundException('Opción no encontrada');
    await this.repo.remove(opcion);
    return { eliminado: true };
  }
}
