import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpresaTransportista } from '../../database/entities/empresa-transportista.entity';
import { Incidencia } from '../../database/entities/incidencia.entity';
import { RegistroIngreso } from '../../database/entities/registro-ingreso.entity';
import { EmpresasController } from './empresas.controller';
import { EmpresasService } from './empresas.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmpresaTransportista, RegistroIngreso, Incidencia])],
  controllers: [EmpresasController],
  providers: [EmpresasService],
})
export class EmpresasModule {}
