import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuracion } from '../entities/configuracion.entity';
import { EmpresaTransportista } from '../entities/empresa-transportista.entity';
import { OpcionCatalogo } from '../entities/opcion-catalogo.entity';
import { User } from '../entities/user.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Configuracion, User, OpcionCatalogo, EmpresaTransportista]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
