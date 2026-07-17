import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateRegistroDto {
  @IsDateString()
  fecha: string;

  @Matches(HORA_REGEX, { message: 'horaIngreso debe tener formato HH:mm' })
  horaIngreso: string;

  @IsInt()
  conductorId: number;

  @IsInt()
  empresaId: number;

  @IsString()
  @MinLength(4)
  patente: string;

  @IsOptional()
  @IsInt()
  motivoId?: number;

  @IsOptional()
  @IsInt()
  areaResponsableId?: number;

  @IsOptional()
  @IsString()
  guiaDespacho?: string;

  @IsOptional()
  @IsBoolean()
  condicionApto?: boolean;

  @IsOptional()
  @IsBoolean()
  eppVerificado?: boolean;

  @IsOptional()
  @IsInt()
  avisoId?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class RegistrarSalidaDto {
  @Matches(HORA_REGEX, { message: 'horaSalida debe tener formato HH:mm' })
  horaSalida: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class FiltrosRegistrosDto {
  @IsOptional()
  @IsDateString()
  desde?: string;

  @IsOptional()
  @IsDateString()
  hasta?: string;

  @IsOptional()
  @IsInt()
  empresaId?: number;

  @IsOptional()
  @IsString()
  patente?: string;

  @IsOptional()
  @IsBoolean()
  dentro?: boolean;
}
