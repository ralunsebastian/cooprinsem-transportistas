import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvisoCamion } from '../../database/entities/aviso-camion.entity';
import { Incidencia } from '../../database/entities/incidencia.entity';
import { RegistroIngreso } from '../../database/entities/registro-ingreso.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroIngreso, AvisoCamion, Incidencia])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
