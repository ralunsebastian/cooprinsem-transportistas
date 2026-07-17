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
import { ConductoresService } from './conductores.service';
import { CreateConductorDto, UpdateConductorDto } from './dto/conductor.dto';

@Controller('conductores')
export class ConductoresController {
  constructor(private readonly service: ConductoresService) {}

  @Get()
  findAll(@Query('busqueda') busqueda?: string) {
    return this.service.findAll(busqueda);
  }

  @Post()
  create(@Body() dto: CreateConductorDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateConductorDto) {
    return this.service.update(id, dto);
  }
}
