import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conductor } from '../../database/entities/conductor.entity';
import { ConductoresController } from './conductores.controller';
import { ConductoresService } from './conductores.service';

@Module({
  imports: [TypeOrmModule.forFeature([Conductor])],
  controllers: [ConductoresController],
  providers: [ConductoresService],
})
export class ConductoresModule {}
