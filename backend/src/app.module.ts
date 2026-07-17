import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { SeedModule } from './database/seeds/seed.module';
import { AuthModule } from './modules/auth/auth.module';
import { AvisosModule } from './modules/avisos/avisos.module';
import { CatalogosModule } from './modules/catalogos/catalogos.module';
import { ConductoresModule } from './modules/conductores/conductores.module';
import { ConfiguracionModule } from './modules/configuracion/configuracion.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { EmpresasModule } from './modules/empresas/empresas.module';
import { IncidenciasModule } from './modules/incidencias/incidencias.module';
import { RegistrosModule } from './modules/registros/registros.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USER', 'root'),
        password: config.get<string>('DB_PASS', ''),
        database: config.get<string>('DB_NAME', 'cooprinsem_transportistas'),
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        charset: 'utf8mb4',
      }),
    }),
    SeedModule,
    AuthModule,
    UsersModule,
    ConfiguracionModule,
    CatalogosModule,
    EmpresasModule,
    ConductoresModule,
    RegistrosModule,
    AvisosModule,
    IncidenciasModule,
    DashboardModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
