import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Bell, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FieldError, Input, Label, Select, Textarea } from '@/components/ui/input';
import { EmptyState, PageHeader, Spinner } from '@/components/ui/misc';
import { Table, Td, Th, THead, Tr } from '@/components/ui/table';
import { api } from '@/lib/api';
import { ESTADO_AVISO, formatFecha } from '@/lib/format';
import type { Aviso, Empresa, EstadoAviso, OpcionCatalogo } from '@/lib/types';
import { useAuthStore } from '@/stores/auth';

export const Route = createFileRoute('/_private/avisos')({
  component: AvisosPage,
});

function AvisosPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [dialogo, setDialogo] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('');

  const params = new URLSearchParams();
  if (filtroEstado) params.set('estado', filtroEstado);

  const { data: avisos, isLoading } = useQuery({
    queryKey: ['avisos', params.toString()],
    queryFn: () => api.get<Aviso[]>(`/avisos?${params.toString()}`),
  });

  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoAviso }) =>
      api.patch(`/avisos/${id}/estado`, { estado }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avisos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <Spinner />;

  return (
    <>
      <PageHeader
        titulo="Avisos de camiones"
        descripcion="Anuncios previos de Bodega y Abastecimiento hacia Patio"
      >
        <Select
          className="w-44"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          {Object.entries(ESTADO_AVISO).map(([valor, { label }]) => (
            <option key={valor} value={valor}>
              {label}
            </option>
          ))}
        </Select>
        <Button variant="brand" onClick={() => setDialogo(true)}>
          <Plus /> Nuevo aviso
        </Button>
      </PageHeader>

      {!avisos?.length ? (
        <EmptyState
          icon={Bell}
          titulo="Sin avisos"
          descripcion="Anuncia la llegada de un camión para que Patio lo espere."
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <Th>Fecha est.</Th>
              <Th>Hora est.</Th>
              <Th>Empresa</Th>
              <Th>Patente</Th>
              <Th>Tonelaje</Th>
              <Th>Motivo</Th>
              <Th>Área</Th>
              <Th>Supervisión</Th>
              <Th>Estado</Th>
              <Th className="text-right">Acciones</Th>
            </tr>
          </THead>
          <tbody>
            {avisos.map((a) => (
              <Tr key={a.id}>
                <Td>{formatFecha(a.fechaEstimada)}</Td>
                <Td className="font-semibold">{a.horaEstimada ?? '—'}</Td>
                <Td>{a.empresa?.nombre ?? '—'}</Td>
                <Td className="font-mono">{a.patente ?? '—'}</Td>
                <Td>{a.tonelaje ? `${a.tonelaje} t` : '—'}</Td>
                <Td>{a.motivo?.nombre ?? '—'}</Td>
                <Td>{a.areaResponsable?.nombre ?? '—'}</Td>
                <Td>
                  {a.requiereSupervision ? (
                    <Badge className="bg-red-100 text-red-700">Sí</Badge>
                  ) : (
                    '—'
                  )}
                </Td>
                <Td>
                  <Badge className={ESTADO_AVISO[a.estado].badge}>
                    {ESTADO_AVISO[a.estado].label}
                  </Badge>
                </Td>
                <Td>
                  {a.estado === 'pendiente' && (
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => cambiarEstado.mutate({ id: a.id, estado: 'no_presentado' })}
                      >
                        No llegó
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => cambiarEstado.mutate({ id: a.id, estado: 'cancelado' })}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      {dialogo && (
        <DialogoAviso
          onClose={() => setDialogo(false)}
          onGuardado={() => {
            queryClient.invalidateQueries({ queryKey: ['avisos'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          }}
        />
      )}
    </>
  );
}

const esquemaAviso = z.object({
  fechaEstimada: z.string().min(10, 'Requerida'),
  horaEstimada: z.string().optional(),
  empresaId: z.coerce.number().optional(),
  patente: z.string().optional(),
  tonelaje: z.coerce.number().optional(),
  motivoId: z.coerce.number().optional(),
  areaResponsableId: z.coerce.number().optional(),
  requiereSupervision: z.boolean(),
  observaciones: z.string().optional(),
});
type AvisoForm = z.infer<typeof esquemaAviso>;

function DialogoAviso({ onClose, onGuardado }: { onClose: () => void; onGuardado: () => void }) {
  const { data: empresas } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => api.get<Empresa[]>('/empresas'),
  });
  const { data: catalogos } = useQuery({
    queryKey: ['catalogos'],
    queryFn: () => api.get<OpcionCatalogo[]>('/catalogos'),
  });
  const motivos = (catalogos ?? []).filter((c) => c.categoria === 'motivo_visita' && c.activo);
  const areas = (catalogos ?? []).filter((c) => c.categoria === 'area_responsable' && c.activo);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AvisoForm>({
    resolver: zodResolver(esquemaAviso),
    defaultValues: { requiereSupervision: false },
  });

  const crear = useMutation({
    mutationFn: (datos: AvisoForm) =>
      api.post('/avisos', {
        ...datos,
        horaEstimada: datos.horaEstimada || undefined,
        empresaId: datos.empresaId || undefined,
        patente: datos.patente || undefined,
        tonelaje: datos.tonelaje || undefined,
        motivoId: datos.motivoId || undefined,
        areaResponsableId: datos.areaResponsableId || undefined,
        observaciones: datos.observaciones || undefined,
      }),
    onSuccess: () => {
      toast.success('Aviso creado');
      onGuardado();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onClose()}>
      <DialogContent title="Nuevo aviso de camión">
        <form onSubmit={handleSubmit((d) => crear.mutate(d))} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Fecha estimada</Label>
              <Input type="date" {...register('fechaEstimada')} />
              <FieldError mensaje={errors.fechaEstimada?.message} />
            </div>
            <div>
              <Label>Hora estimada (opcional)</Label>
              <Input type="time" {...register('horaEstimada')} />
            </div>
            <div>
              <Label>Empresa (opcional)</Label>
              <Select {...register('empresaId')}>
                <option value="">Sin definir</option>
                {(empresas ?? []).map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Patente (opcional)</Label>
              <Input placeholder="AB-CD-12" {...register('patente')} />
            </div>
            <div>
              <Label>Tonelaje (opcional)</Label>
              <Input type="number" step="0.1" placeholder="Ej: 28" {...register('tonelaje')} />
            </div>
            <div>
              <Label>Motivo</Label>
              <Select {...register('motivoId')}>
                <option value="">Seleccionar…</option>
                {motivos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Área responsable</Label>
              <Select {...register('areaResponsableId')}>
                <option value="">Seleccionar…</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 size-4 accent-brand-600"
              {...register('requiereSupervision')}
            />
            <span className="text-sm text-forest-800">
              <span className="font-semibold">Requiere supervisión presencial</span>
              <span className="block text-xs text-forest-400">
                Ej: descarga de Nitrógeno INDURA u otras cargas peligrosas.
              </span>
            </span>
          </label>
          <div>
            <Label>Observaciones (opcional)</Label>
            <Textarea rows={2} {...register('observaciones')} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="brand" disabled={crear.isPending}>
              {crear.isPending ? 'Creando…' : 'Crear aviso'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
