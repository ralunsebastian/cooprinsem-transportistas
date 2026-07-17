import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EstadoAviso } from '../../common/enums';
import { Conductor } from './conductor.entity';
import { EmpresaTransportista } from './empresa-transportista.entity';
import { OpcionCatalogo } from './opcion-catalogo.entity';
import { User } from './user.entity';

@Entity('aviso_camion')
export class AvisoCamion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fechaEstimada: string;

  @Column({ nullable: true, type: 'varchar', length: 5 })
  horaEstimada: string | null;

  @Column({ nullable: true, type: 'int' })
  empresaId: number | null;

  @ManyToOne(() => EmpresaTransportista, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'empresaId' })
  empresa: EmpresaTransportista | null;

  @Column({ nullable: true, type: 'int' })
  conductorId: number | null;

  @ManyToOne(() => Conductor, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'conductorId' })
  conductor: Conductor | null;

  @Column({ nullable: true, type: 'varchar' })
  patente: string | null;

  @Column({ nullable: true, type: 'decimal', precision: 8, scale: 2 })
  tonelaje: number | null;

  @Column({ nullable: true, type: 'int' })
  motivoId: number | null;

  @ManyToOne(() => OpcionCatalogo, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'motivoId' })
  motivo: OpcionCatalogo | null;

  @Column({ nullable: true, type: 'int' })
  areaResponsableId: number | null;

  @ManyToOne(() => OpcionCatalogo, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'areaResponsableId' })
  areaResponsable: OpcionCatalogo | null;

  /** Descargas riesgosas (ej. nitrógeno INDURA) exigen supervisión presencial. */
  @Column({ default: false })
  requiereSupervision: boolean;

  @Column({ type: 'enum', enum: EstadoAviso, default: EstadoAviso.PENDIENTE })
  estado: EstadoAviso;

  @Column({ nullable: true, type: 'text' })
  observaciones: string | null;

  @Column({ nullable: true, type: 'int' })
  creadoPorUserId: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'creadoPorUserId' })
  creadoPor: User | null;

  @CreateDateColumn()
  createdAt: Date;
}
