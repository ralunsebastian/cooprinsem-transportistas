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
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Roles } from '../../common/decorators/roles.decorator';
import { CategoriaCatalogo, RolUsuario } from '../../common/enums';
import { CatalogosService } from './catalogos.service';

class CreateOpcionDto {
  @IsEnum(CategoriaCatalogo)
  categoria: CategoriaCatalogo;

  @IsString()
  @MinLength(2)
  nombre: string;

  @IsOptional()
  @IsInt()
  orden?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

class UpdateOpcionDto extends PartialType(CreateOpcionDto) {}

@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly service: CatalogosService) {}

  @Get()
  findAll(@Query('categoria') categoria?: CategoriaCatalogo) {
    return this.service.findAll(categoria);
  }

  @Post()
  @Roles(RolUsuario.ADMIN)
  create(@Body() dto: CreateOpcionDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(RolUsuario.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOpcionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(RolUsuario.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
