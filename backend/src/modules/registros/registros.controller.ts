import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser, UsuarioActual } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '../../common/enums';
import { CreateRegistroDto, FiltrosRegistrosDto, RegistrarSalidaDto } from './dto/registro.dto';
import { RegistrosService } from './registros.service';

@Controller('registros')
export class RegistrosController {
  constructor(private readonly service: RegistrosService) {}

  @Get()
  findAll(@Query() filtros: FiltrosRegistrosDto) {
    return this.service.findAll(filtros);
  }

  @Post()
  @Roles(RolUsuario.PORTERIA)
  create(@Body() dto: CreateRegistroDto, @CurrentUser() user: UsuarioActual) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id/salida')
  @Roles(RolUsuario.PORTERIA)
  registrarSalida(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RegistrarSalidaDto,
    @CurrentUser() user: UsuarioActual,
  ) {
    return this.service.registrarSalida(id, dto, user.id);
  }
}
