import { PartialType } from '@nestjs/mapped-types';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { SeveridadIncidencia } from '../../../common/enums';

export class CreateIncidenciaDto {
  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsInt()
  registroIngresoId?: number;

  @IsInt()
  empresaId: number;

  @IsOptional()
  @IsInt()
  conductorId?: number;

  @IsOptional()
  @IsInt()
  tipoId?: number;

  @IsEnum(SeveridadIncidencia)
  severidad: SeveridadIncidencia;

  @IsString()
  @MinLength(5)
  descripcion: string;
}

export class UpdateIncidenciaDto extends PartialType(CreateIncidenciaDto) {}
