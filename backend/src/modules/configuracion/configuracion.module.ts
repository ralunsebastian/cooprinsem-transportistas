import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuracion } from '../../database/entities/configuracion.entity';
import { ConfiguracionController } from './configuracion.controller';
import { ConfiguracionService } from './configuracion.service';

@Module({
  imports: [TypeOrmModule.forFeature([Configuracion])],
  controllers: [ConfiguracionController],
  providers: [ConfiguracionService],
  exports: [ConfiguracionService],
})
export class ConfiguracionModule {}
