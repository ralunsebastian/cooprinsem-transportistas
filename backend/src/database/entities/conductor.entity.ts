import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EmpresaTransportista } from './empresa-transportista.entity';

@Entity('conductor')
export class Conductor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  rut: string;

  @Column({ nullable: true, type: 'varchar' })
  telefono: string | null;

  /** Empresa habitual; puede cambiar entre ingresos. */
  @Column({ nullable: true, type: 'int' })
  empresaId: number | null;

  @ManyToOne(() => EmpresaTransportista, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'empresaId' })
  empresa: EmpresaTransportista | null;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
