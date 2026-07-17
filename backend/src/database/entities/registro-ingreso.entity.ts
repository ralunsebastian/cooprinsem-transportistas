import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AvisoCamion } from './aviso-camion.entity';
import { Conductor } from './conductor.entity';
import { EmpresaTransportista } from './empresa-transportista.entity';
import { OpcionCatalogo } from './opcion-catalogo.entity';
import { User } from './user.entity';

@Entity('registro_ingreso')
export class RegistroIngreso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'varchar', length: 5 })
  horaIngreso: string;

  /** null = el camión sigue dentro del recinto. */
  @Column({ nullable: true, type: 'varchar', length: 5 })
  horaSalida: string | null;

  @Column()
  conductorId: number;

  @ManyToOne(() => Conductor, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'conductorId' })
  conductor: Conductor;

  @Column()
  empresaId: number;

  @ManyToOne(() => EmpresaTransportista, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'empresaId' })
  empresa: EmpresaTransportista;

  @Column()
  patente: string;

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

  @Column({ nullable: true, type: 'varchar' })
  guiaDespacho: string | null;

  /** Checklist del protocolo: conductor apto (sin fatiga/alcohol/drogas). */
  @Column({ default: true })
  condicionApto: boolean;

  /** Checklist del protocolo: EPP verificado en portería. */
  @Column({ default: true })
  eppVerificado: boolean;

  @Column({ nullable: true, type: 'int' })
  avisoId: number | null;

  @ManyToOne(() => AvisoCamion, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'avisoId' })
  aviso: AvisoCamion | null;

  @Column({ nullable: true, type: 'text' })
  observaciones: string | null;

  @Column({ nullable: true, type: 'int' })
  creadoPorUserId: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'creadoPorUserId' })
  creadoPor: User | null;

  @Column({ nullable: true, type: 'int' })
  salidaAutorizadaPorUserId: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'salidaAutorizadaPorUserId' })
  salidaAutorizadaPor: User | null;

  @CreateDateColumn()
  createdAt: Date;
}
