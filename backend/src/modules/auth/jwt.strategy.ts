import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuarioActual } from '../../common/decorators/current-user.decorator';
import { RolUsuario } from '../../common/enums';

export interface JwtPayload {
  sub: number;
  email: string;
  rol: RolUsuario;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET no está definido');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload): UsuarioActual {
    if (!payload?.sub) throw new UnauthorizedException();
    return {
      id: payload.sub,
      email: payload.email,
      rol: payload.rol,
    };
  }
}
