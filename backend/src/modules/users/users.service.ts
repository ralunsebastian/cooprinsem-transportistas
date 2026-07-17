import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  findAll() {
    return this.repo.find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async create(dto: CreateUserDto) {
    const existente = await this.repo.findOne({ where: { email: dto.email } });
    if (existente) throw new ConflictException('Ya existe un usuario con ese email');

    const { password, ...datos } = dto;
    const user = this.repo.create({
      ...datos,
      passwordHash: await bcrypt.hash(password, 10),
    });
    const guardado = await this.repo.save(user);
    return this.findOne(guardado.id);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    const { password, ...datos } = dto;
    Object.assign(user, datos);
    if (password) user.passwordHash = await bcrypt.hash(password, 10);
    await this.repo.save(user);
    return this.findOne(id);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.repo.remove(user);
    return { eliminado: true };
  }
}
