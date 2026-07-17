import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateEmpresaDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsOptional()
  @IsString()
  rut?: string;

  @IsOptional()
  @IsString()
  contacto?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdateEmpresaDto extends PartialType(CreateEmpresaDto) {}
