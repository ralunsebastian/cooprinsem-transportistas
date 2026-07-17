import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { EstadoAviso } from '../../../common/enums';

export class CreateAvisoDto {
  @IsDateString()
  fechaEstimada: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'horaEstimada debe tener formato HH:mm' })
  horaEstimada?: string;

  @IsOptional()
  @IsInt()
  empresaId?: number;

  @IsOptional()
  @IsInt()
  conductorId?: number;

  @IsOptional()
  @IsString()
  patente?: string;

  @IsOptional()
  @IsNumber()
  tonelaje?: number;

  @IsOptional()
  @IsInt()
  motivoId?: number;

  @IsOptional()
  @IsInt()
  areaResponsableId?: number;

  @IsOptional()
  @IsBoolean()
  requiereSupervision?: boolean;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class UpdateAvisoDto extends PartialType(CreateAvisoDto) {}

export class CambiarEstadoAvisoDto {
  @IsEnum(EstadoAviso)
  estado: EstadoAviso;
}
