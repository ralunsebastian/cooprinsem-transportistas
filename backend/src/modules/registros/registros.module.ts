import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvisoCamion } from '../../database/entities/aviso-camion.entity';
import { RegistroIngreso } from '../../database/entities/registro-ingreso.entity';
import { RegistrosController } from './registros.controller';
import { RegistrosService } from './registros.service';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroIngreso, AvisoCamion])],
  controllers: [RegistrosController],
  providers: [RegistrosService],
})
export class RegistrosModule {}
