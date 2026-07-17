import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThanOrEqual, Repository } from 'typeorm';
import { EstadoAviso } from '../../common/enums';
import { AvisoCamion } from '../../database/entities/aviso-camion.entity';
import { Incidencia } from '../../database/entities/incidencia.entity';
import { RegistroIngreso } from '../../database/entities/registro-ingreso.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(RegistroIngreso)
    private readonly registrosRepo: Repository<RegistroIngreso>,
    @InjectRepository(AvisoCamion)
    private readonly avisosRepo: Repository<AvisoCamion>,
    @InjectRepository(Incidencia)
    private readonly incidenciasRepo: Repository<Incidencia>,
  ) {}

  async resumen() {
    const hoy = new Date().toISOString().slice(0, 10);
    const inicioMes = `${hoy.slice(0, 7)}-01`;

    const [dentro, ingresosHoy, avisosHoy, incidenciasMes] = await Promise.all([
      this.registrosRepo.find({
        where: { horaSalida: IsNull() },
        relations: ['conductor', 'empresa', 'motivo', 'areaResponsable', 'aviso'],
        order: { fecha: 'ASC', horaIngreso: 'ASC' },
      }),
      this.registrosRepo.count({ where: { fecha: hoy } }),
      this.avisosRepo.find({
        where: { fechaEstimada: hoy, estado: EstadoAviso.PENDIENTE },
        relations: ['empresa', 'conductor', 'motivo', 'areaResponsable'],
        order: { horaEstimada: 'ASC' },
      }),
      this.incidenciasRepo.count({ where: { fecha: MoreThanOrEqual(inicioMes) } }),
    ]);

    return {
      dentroAhora: dentro.length,
      ingresosHoy,
      avisosPendientesHoy: avisosHoy.length,
      incidenciasMes,
      camionesDentro: dentro,
      avisosHoy,
    };
  }
}
