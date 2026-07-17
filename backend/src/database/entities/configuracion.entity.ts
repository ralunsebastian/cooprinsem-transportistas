import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('configuracion')
export class Configuracion {
  @PrimaryColumn()
  clave: string;

  @Column({ type: 'text' })
  valor: string;

  @Column({ nullable: true, type: 'varchar' })
  descripcion: string | null;
}
