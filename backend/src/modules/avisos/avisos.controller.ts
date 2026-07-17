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
import { EstadoAviso, RolUsuario } from '../../common/enums';
import { AvisosService } from './avisos.service';
import { CambiarEstadoAvisoDto, CreateAvisoDto, UpdateAvisoDto } from './dto/aviso.dto';

@Controller('avisos')
export class AvisosController {
  constructor(private readonly service: AvisosService) {}

  @Get()
  findAll(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('estado') estado?: EstadoAviso,
  ) {
    return this.service.findAll(desde, hasta, estado);
  }

  @Get('hoy')
  hoy() {
    return this.service.hoy();
  }

  @Post()
  @Roles(RolUsuario.SOLICITANTE, RolUsuario.PORTERIA)
  create(@Body() dto: CreateAvisoDto, @CurrentUser() user: UsuarioActual) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id')
  @Roles(RolUsuario.SOLICITANTE, RolUsuario.PORTERIA)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAvisoDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/estado')
  @Roles(RolUsuario.SOLICITANTE, RolUsuario.PORTERIA)
  cambiarEstado(@Param('id', ParseIntPipe) id: number, @Body() dto: CambiarEstadoAvisoDto) {
    return this.service.cambiarEstado(id, dto);
  }
}
