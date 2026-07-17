import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpcionCatalogo } from '../../database/entities/opcion-catalogo.entity';
import { CatalogosController } from './catalogos.controller';
import { CatalogosService } from './catalogos.service';

@Module({
  imports: [TypeOrmModule.forFeature([OpcionCatalogo])],
  controllers: [CatalogosController],
  providers: [CatalogosService],
})
export class CatalogosModule {}
