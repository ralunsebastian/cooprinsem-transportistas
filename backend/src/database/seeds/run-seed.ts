import 'dotenv/config';
import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { CategoriaCatalogo, RolUsuario } from '../../common/enums';
import { CONFIG_DEFAULTS } from '../../modules/configuracion/configuracion.service';
import { AvisoCamion } from '../entities/aviso-camion.entity';
import { Conductor } from '../entities/conductor.entity';
import { Configuracion } from '../entities/configuracion.entity';
import { EmpresaTransportista } from '../entities/empresa-transportista.entity';
import { Incidencia } from '../entities/incidencia.entity';
import { OpcionCatalogo } from '../entities/opcion-catalogo.entity';
import { RegistroIngreso } from '../entities/registro-ingreso.entity';
import { User } from '../entities/user.entity';
import { ADMIN_DEFAULT, EMPRESAS_DEMO, OPCIONES_CATALOGO, USUARIOS_DEMO } from './seed-data';

async function main() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASS ?? '',
    database: process.env.DB_NAME ?? 'cooprinsem_transportistas',
    entities: [
      User,
      Configuracion,
      OpcionCatalogo,
      EmpresaTransportista,
      Conductor,
      AvisoCamion,
      RegistroIngreso,
      Incidencia,
    ],
    synchronize: true,
    charset: 'utf8mb4',
  });
  await dataSource.initialize();

  const configRepo = dataSource.getRepository(Configuracion);
  for (const [clave, { valor, descripcion }] of Object.entries(CONFIG_DEFAULTS)) {
    if (!(await configRepo.findOne({ where: { clave } }))) {
      await configRepo.save(configRepo.create({ clave, valor, descripcion }));
      console.log(`✔ configuración ${clave}`);
    }
  }

  const opcionesRepo = dataSource.getRepository(OpcionCatalogo);
  for (const [categoria, nombres] of Object.entries(OPCIONES_CATALOGO)) {
    const existentes = await opcionesRepo.count({
      where: { categoria: categoria as CategoriaCatalogo },
    });
    if (existentes === 0) {
      await opcionesRepo.save(
        opcionesRepo.create(
          nombres.map((nombre, orden) => ({
            categoria: categoria as CategoriaCatalogo,
            nombre,
            orden,
          })),
        ),
      );
      console.log(`✔ catálogo ${categoria} (${nombres.length} opciones)`);
    }
  }

  const empresasRepo = dataSource.getRepository(EmpresaTransportista);
  for (const empresa of EMPRESAS_DEMO) {
    if (!(await empresasRepo.findOne({ where: { nombre: empresa.nombre } }))) {
      await empresasRepo.save(empresasRepo.create(empresa));
      console.log(`✔ empresa ${empresa.nombre}`);
    }
  }

  const usersRepo = dataSource.getRepository(User);
  if (!(await usersRepo.findOne({ where: { email: ADMIN_DEFAULT.email } }))) {
    await usersRepo.save(
      usersRepo.create({
        email: ADMIN_DEFAULT.email,
        nombre: ADMIN_DEFAULT.nombre,
        rol: RolUsuario.ADMIN,
        passwordHash: await bcrypt.hash(ADMIN_DEFAULT.password, 10),
      }),
    );
    console.log(`✔ admin creado: ${ADMIN_DEFAULT.email} / ${ADMIN_DEFAULT.password}`);
  }
  for (const demo of USUARIOS_DEMO) {
    if (!(await usersRepo.findOne({ where: { email: demo.email } }))) {
      await usersRepo.save(
        usersRepo.create({
          email: demo.email,
          nombre: demo.nombre,
          rol: demo.rol as RolUsuario,
          passwordHash: await bcrypt.hash(demo.password, 10),
        }),
      );
      console.log(`✔ usuario creado: ${demo.email} / ${demo.password}`);
    }
  }

  await dataSource.destroy();
  console.log('Seed completado.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
