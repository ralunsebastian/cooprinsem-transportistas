import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RolUsuario } from '../enums';

export interface UsuarioActual {
  id: number;
  email: string;
  rol: RolUsuario;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UsuarioActual =>
    ctx.switchToHttp().getRequest().user,
);
