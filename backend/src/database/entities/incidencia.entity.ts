import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SeveridadIncidencia } from '../../common/enums';
import { Conductor } from './conductor.entity';
import { EmpresaTransportista } from './empresa-transportista.entity';
import { OpcionCatalogo } from './opcion-catalogo.entity';
import { RegistroIngreso } from './registro-ingreso.entity';
import { User } from './user.entity';

@Entity('incidencia')
export class Incidencia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ nullable: true, type: 'int' })
  registroIngresoId: number | null;

  @ManyToOne(() => RegistroIngreso, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'registroIngresoId' })
  registroIngreso: RegistroIngreso | null;

  @Column()
  empresaId: number;

  @ManyToOne(() => EmpresaTransportista, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'empresaId' })
  empresa: EmpresaTransportista;

  @Column({ nullable: true, type: 'int' })
  conductorId: number | null;

  @ManyToOne(() => Conductor, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'conductorId' })
  conductor: Conductor | null;

  @Column({ nullable: true, type: 'int' })
  tipoId: number | null;

  @ManyToOne(() => OpcionCatalogo, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tipoId' })
  tipo: OpcionCatalogo | null;

  @Column({ type: 'enum', enum: SeveridadIncidencia, default: SeveridadIncidencia.LEVE })
  severidad: SeveridadIncidencia;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ nullable: true, type: 'int' })
  creadoPorUserId: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'creadoPorUserId' })
  creadoPor: User | null;

  @CreateDateColumn()
  createdAt: Date;
}
