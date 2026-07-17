import {
  Body,
  Controller,
  Delete,
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
import { CreateIncidenciaDto, UpdateIncidenciaDto } from './dto/incidencia.dto';
import { IncidenciasService } from './incidencias.service';

@Controller('incidencias')
export class IncidenciasController {
  constructor(private readonly service: IncidenciasService) {}

  @Get()
  findAll(
    @Query('empresaId') empresaId?: number,
    @Query('conductorId') conductorId?: number,
  ) {
    return this.service.findAll(empresaId, conductorId);
  }

  @Post()
  @Roles(RolUsuario.PORTERIA)
  create(@Body() dto: CreateIncidenciaDto, @CurrentUser() user: UsuarioActual) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id')
  @Roles(RolUsuario.PORTERIA)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateIncidenciaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(RolUsuario.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
