import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvisoCamion } from '../../database/entities/aviso-camion.entity';
import { AvisosController } from './avisos.controller';
import { AvisosService } from './avisos.service';

@Module({
  imports: [TypeOrmModule.forFeature([AvisoCamion])],
  controllers: [AvisosController],
  providers: [AvisosService],
})
export class AvisosModule {}
