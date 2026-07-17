import { Body, Controller, Get, NotFoundException, Param, Patch } from '@nestjs/common';
import { IsString } from 'class-validator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '../../common/enums';
import { ConfiguracionService } from './configuracion.service';

class ActualizarConfigDto {
  @IsString()
  valor: string;
}

@Controller('configuracion')
export class ConfiguracionController {
  constructor(private readonly service: ConfiguracionService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Patch(':clave')
  @Roles(RolUsuario.ADMIN)
  async actualizar(@Param('clave') clave: string, @Body() dto: ActualizarConfigDto) {
    const actualizada = await this.service.actualizar(clave, dto.valor);
    if (!actualizada) throw new NotFoundException(`Configuración ${clave} no existe`);
    return actualizada;
  }
}
