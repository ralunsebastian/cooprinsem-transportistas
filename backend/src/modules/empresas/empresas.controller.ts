import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CreateEmpresaDto, UpdateEmpresaDto } from './dto/empresa.dto';
import { EmpresasService } from './empresas.service';

@Controller('empresas')
export class EmpresasController {
  constructor(private readonly service: EmpresasService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id/ficha')
  ficha(@Param('id', ParseIntPipe) id: number) {
    return this.service.ficha(id);
  }

  @Post()
  create(@Body() dto: CreateEmpresaDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEmpresaDto) {
    return this.service.update(id, dto);
  }
}
