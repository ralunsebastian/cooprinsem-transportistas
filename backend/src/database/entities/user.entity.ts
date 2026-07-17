import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { RolUsuario } from '../../common/enums';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  passwordHash: string;

  @Column()
  nombre: string;

  @Column({ type: 'enum', enum: RolUsuario, default: RolUsuario.PORTERIA })
  rol: RolUsuario;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
