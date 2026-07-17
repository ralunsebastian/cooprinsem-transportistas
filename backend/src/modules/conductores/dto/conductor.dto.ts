import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateConductorDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsString()
  @MinLength(7)
  rut: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsInt()
  empresaId?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdateConductorDto extends PartialType(CreateConductorDto) {}
