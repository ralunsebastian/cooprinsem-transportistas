import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('empresa_transportista')
export class EmpresaTransportista {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string;

  @Column({ nullable: true, type: 'varchar' })
  rut: string | null;

  @Column({ nullable: true, type: 'varchar' })
  contacto: string | null;

  @Column({ nullable: true, type: 'varchar' })
  telefono: string | null;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
