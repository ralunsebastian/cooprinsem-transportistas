import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { RolUsuario } from '../../../common/enums';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(2)
  nombre: string;

  @IsEnum(RolUsuario)
  rol: RolUsuario;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
