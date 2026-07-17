import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersRepo.findOne({
      where: { email, activo: true },
      select: ['id', 'email', 'passwordHash', 'nombre', 'rol'],
    });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email, rol: user.rol };
    return {
      token: await this.jwtService.signAsync(payload),
      user: { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol },
    };
  }

  async me(userId: number) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol };
  }
}
