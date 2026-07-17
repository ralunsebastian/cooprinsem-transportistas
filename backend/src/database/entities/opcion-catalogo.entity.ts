import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { CategoriaCatalogo } from '../../common/enums';

@Entity('opcion_catalogo')
@Index(['categoria', 'nombre'], { unique: true })
export class OpcionCatalogo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: CategoriaCatalogo })
  categoria: CategoriaCatalogo;

  @Column()
  nombre: string;

  @Column({ default: 0 })
  orden: number;

  @Column({ default: true })
  activo: boolean;
}
