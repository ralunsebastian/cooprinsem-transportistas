import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { AlertTriangle, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ComboboxBuscable } from '@/components/ui/combobox';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FieldError, Input, Label, Select, Textarea } from '@/components/ui/input';
import { EmptyState, PageHeader, Spinner } from '@/components/ui/misc';
import { Table, Td, Th, THead, Tr } from '@/components/ui/table';
import { api } from '@/lib/api';
import { formatFecha, hoyISO, SEVERIDAD } from '@/lib/format';
import type { Conductor, Empresa, Incidencia, OpcionCatalogo } from '@/lib/types';
import { useAuthStore } from '@/stores/auth';

export const Route = createFileRoute('/_private/incidencias')({
  component: IncidenciasPage,
});

function IncidenciasPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [dialogo, setDialogo] = useState(false);
  const [filtroEmpresa, setFiltroEmpresa] = useState('');

  const params = new URLSearchParams();
  if (filtroEmpresa) params.set('empresaId', filtroEmpresa);

  const { data: incidencias, isLoading } = useQuery({
    queryKey: ['incidencias', params.toString()],
    queryFn: () => api.get<Incidencia[]>(`/incidencias?${params.toString()}`),
  });
  const { data: empresas } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => api.get<Empresa[]>('/empresas'),
  });

  const puedeOperar = user?.rol === 'admin' || user?.rol === 'porteria';

  if (isLoading) return <Spinner />;

  return (
    <>
      <PageHeader
        titulo="Incidencias"
        descripcion="Trazabilidad de eventos y transportistas problemáticos"
      >
        <ComboboxBuscable
          className="w-56"
          opciones={(empresas ?? []).map((e) => ({ valor: String(e.id), label: e.nombre }))}
          valor={filtroEmpresa}
          onCambio={setFiltroEmpresa}
        />
        {puedeOperar && (
          <Button variant="brand" onClick={() => setDialogo(true)}>
            <Plus /> Nueva incidencia
          </Button>
        )}
      </PageHeader>

      {!incidencias?.length ? (
        <EmptyState
          icon={AlertTriangle}
          titulo="Sin incidencias"
          descripcion="No hay incidencias registradas con los filtros actuales."
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <Th>Fecha</Th>
              <Th>Empresa</Th>
              <Th>Conductor</Th>
              <Th>Tipo</Th>
              <Th>Severidad</Th>
              <Th>Descripción</Th>
              <Th>Registrada por</Th>
            </tr>
          </THead>
          <tbody>
            {incidencias.map((i) => (
              <Tr key={i.id}>
                <Td>{formatFecha(i.fecha)}</Td>
                <Td className="font-medium">{i.empresa?.nombre}</Td>
                <Td>{i.conductor?.nombre ?? '—'}</Td>
                <Td>{i.tipo?.nombre ?? '—'}</Td>
                <Td>
                  <Badge className={SEVERIDAD[i.severidad].badge}>
                    {SEVERIDAD[i.severidad].label}
                  </Badge>
                </Td>
                <Td className="max-w-md">{i.descripcion}</Td>
                <Td>{i.creadoPor?.nombre ?? '—'}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      {dialogo && (
        <DialogoIncidencia
          onClose={() => setDialogo(false)}
          onGuardada={() => {
            queryClient.invalidateQueries({ queryKey: ['incidencias'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          }}
        />
      )}
    </>
  );
}

const esquemaIncidencia = z.object({
  fecha: z.string().min(10, 'Requerida'),
  empresaId: z.coerce.number().int().positive('Selecciona una empresa'),
  conductorId: z.coerce.number().optional(),
  tipoId: z.coerce.number().optional(),
  severidad: z.enum(['leve', 'grave']),
  descripcion: z.string().min(5, 'Describe lo ocurrido'),
});
type IncidenciaForm = z.infer<typeof esquemaIncidencia>;

function DialogoIncidencia({
  onClose,
  onGuardada,
}: {
  onClose: () => void;
  onGuardada: () => void;
}) {
  const { data: empresas } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => api.get<Empresa[]>('/empresas'),
  });
  const { data: conductores } = useQuery({
    queryKey: ['conductores'],
    queryFn: () => api.get<Conductor[]>('/conductores'),
  });
  const { data: catalogos } = useQuery({
    queryKey: ['catalogos'],
    queryFn: () => api.get<OpcionCatalogo[]>('/catalogos'),
  });
  const tipos = (catalogos ?? []).filter((c) => c.categoria === 'tipo_incidencia' && c.activo);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IncidenciaForm>({
    resolver: zodResolver(esquemaIncidencia),
    defaultValues: { fecha: hoyISO(), severidad: 'leve' },
  });
  const empresaId = watch('empresaId');

  const crear = useMutation({
    mutationFn: (datos: IncidenciaForm) =>
      api.post('/incidencias', {
        ...datos,
        conductorId: datos.conductorId || undefined,
        tipoId: datos.tipoId || undefined,
      }),
    onSuccess: () => {
      toast.success('Incidencia registrada');
      onGuardada();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onClose()}>
      <DialogContent title="Nueva incidencia">
        <form onSubmit={handleSubmit((d) => crear.mutate(d))} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Fecha</Label>
              <Input type="date" {...register('fecha')} />
              <FieldError mensaje={errors.fecha?.message} />
            </div>
            <div>
              <Label>Severidad</Label>
              <Select {...register('severidad')}>
                <option value="leve">Leve</option>
                <option value="grave">Grave</option>
              </Select>
            </div>
            <div>
              <Label>Empresa</Label>
              <ComboboxBuscable
                opciones={(empresas ?? []).map((e) => ({ valor: String(e.id), label: e.nombre }))}
                valor={empresaId ? String(empresaId) : ''}
                onCambio={(v) => setValue('empresaId', Number(v) as never)}
                todasLabel={null}
                placeholder="Seleccionar empresa…"
              />
              <FieldError mensaje={errors.empresaId?.message} />
            </div>
            <div>
              <Label>Conductor (opcional)</Label>
              <Select {...register('conductorId')}>
                <option value="">Sin conductor</option>
                {(conductores ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.rut})
                  </option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Tipo de incidencia</Label>
              <Select {...register('tipoId')}>
                <option value="">Seleccionar…</option>
                {tipos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label>Descripción</Label>
            <Textarea rows={3} placeholder="Qué ocurrió, dónde y quiénes participaron" {...register('descripcion')} />
            <FieldError mensaje={errors.descripcion?.message} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="brand" disabled={crear.isPending}>
              {crear.isPending ? 'Guardando…' : 'Registrar incidencia'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
