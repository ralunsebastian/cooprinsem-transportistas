import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { DataSource, Repository } from 'typeorm';
import { CategoriaCatalogo, RolUsuario } from '../../common/enums';
import { CONFIG_DEFAULTS } from '../../modules/configuracion/configuracion.service';
import { Configuracion } from '../entities/configuracion.entity';
import { EmpresaTransportista } from '../entities/empresa-transportista.entity';
import { OpcionCatalogo } from '../entities/opcion-catalogo.entity';
import { User } from '../entities/user.entity';
import { ADMIN_DEFAULT, EMPRESAS_DEMO, OPCIONES_CATALOGO, USUARIOS_DEMO } from './seed-data';

/**
 * Seed idempotente al arrancar: solo inserta catálogos/config/usuarios si faltan.
 * Permite que QA (hosting sin SSH) quede operativo en el primer boot.
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Configuracion) private readonly configRepo: Repository<Configuracion>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(OpcionCatalogo) private readonly opcionesRepo: Repository<OpcionCatalogo>,
    @InjectRepository(EmpresaTransportista)
    private readonly empresasRepo: Repository<EmpresaTransportista>,
    private readonly dataSource: DataSource,
  ) {}

  async onApplicationBootstrap() {
    // Refuerzo del sync de esquema: en el hosting se observó que el sync del
    // arranque no siempre crea tablas nuevas; se reintenta explícito y con log.
    try {
      await this.dataSource.synchronize();
      this.logger.log('Esquema sincronizado');
    } catch (error) {
      this.logger.error(`Sync de esquema falló: ${(error as Error).message}`);
    }
    try {
      for (const [clave, { valor, descripcion }] of Object.entries(CONFIG_DEFAULTS)) {
        if (!(await this.configRepo.findOne({ where: { clave } }))) {
          await this.configRepo.save(this.configRepo.create({ clave, valor, descripcion }));
          this.logger.log(`Seed: configuración ${clave}`);
        }
      }

      for (const [categoria, nombres] of Object.entries(OPCIONES_CATALOGO)) {
        const existentes = await this.opcionesRepo.count({
          where: { categoria: categoria as CategoriaCatalogo },
        });
        if (existentes === 0) {
          await this.opcionesRepo.save(
            this.opcionesRepo.create(
              nombres.map((nombre, orden) => ({
                categoria: categoria as CategoriaCatalogo,
                nombre,
                orden,
              })),
            ),
          );
          this.logger.log(`Seed: catálogo ${categoria} (${nombres.length} opciones)`);
        }
      }

      for (const empresa of EMPRESAS_DEMO) {
        if (!(await this.empresasRepo.findOne({ where: { nombre: empresa.nombre } }))) {
          await this.empresasRepo.save(this.empresasRepo.create(empresa));
          this.logger.log(`Seed: empresa ${empresa.nombre}`);
        }
      }

      if ((await this.usersRepo.count()) === 0) {
        await this.usersRepo.save(
          this.usersRepo.create({
            email: ADMIN_DEFAULT.email,
            nombre: ADMIN_DEFAULT.nombre,
            rol: RolUsuario.ADMIN,
            passwordHash: await bcrypt.hash(ADMIN_DEFAULT.password, 10),
          }),
        );
        this.logger.log(`Seed: usuario admin ${ADMIN_DEFAULT.email}`);

        for (const demo of USUARIOS_DEMO) {
          await this.usersRepo.save(
            this.usersRepo.create({
              email: demo.email,
              nombre: demo.nombre,
              rol: demo.rol as RolUsuario,
              passwordHash: await bcrypt.hash(demo.password, 10),
            }),
          );
          this.logger.log(`Seed: usuario ${demo.email}`);
        }
      }
    } catch (error) {
      this.logger.error(`Seed al arrancar falló: ${(error as Error).message}`);
    }
  }
}
