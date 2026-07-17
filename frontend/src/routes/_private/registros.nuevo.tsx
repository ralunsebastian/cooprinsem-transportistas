import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { ComboboxBuscable } from '@/components/ui/combobox';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FieldError, Input, Label, Select, Textarea } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/misc';
import { api } from '@/lib/api';
import { horaAhora, hoyISO } from '@/lib/format';
import type { Aviso, Conductor, Empresa, OpcionCatalogo } from '@/lib/types';
import { useAuthStore } from '@/stores/auth';

export const Route = createFileRoute('/_private/registros/nuevo')({
  beforeLoad: () => {
    const rol = useAuthStore.getState().user?.rol;
    if (rol !== 'admin' && rol !== 'porteria') throw redirect({ to: '/dashboard' });
  },
  component: NuevoRegistroPage,
});

const esquema = z.object({
  fecha: z.string().min(10, 'Requerida'),
  horaIngreso: z.string().min(5, 'Requerida'),
  conductorId: z.coerce.number().int().positive('Selecciona un conductor'),
  empresaId: z.coerce.number().int().positive('Selecciona una empresa'),
  patente: z.string().min(4, 'Requerida'),
  motivoId: z.coerce.number().optional(),
  areaResponsableId: z.coerce.number().optional(),
  guiaDespacho: z.string().optional(),
  condicionApto: z.boolean(),
  eppVerificado: z.boolean(),
  avisoId: z.coerce.number().optional(),
  observaciones: z.string().optional(),
});
type FormValues = z.infer<typeof esquema>;

function NuevoRegistroPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dialogoConductor, setDialogoConductor] = useState(false);
  const [dialogoEmpresa, setDialogoEmpresa] = useState(false);

  const { data: conductores } = useQuery({
    queryKey: ['conductores'],
    queryFn: () => api.get<Conductor[]>('/conductores'),
  });
  const { data: empresas } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => api.get<Empresa[]>('/empresas'),
  });
  const { data: catalogos } = useQuery({
    queryKey: ['catalogos'],
    queryFn: () => api.get<OpcionCatalogo[]>('/catalogos'),
  });
  const { data: avisosHoy } = useQuery({
    queryKey: ['avisos', 'hoy'],
    queryFn: () => api.get<Aviso[]>('/avisos/hoy'),
  });

  const motivos = (catalogos ?? []).filter((c) => c.categoria === 'motivo_visita' && c.activo);
  const areas = (catalogos ?? []).filter((c) => c.categoria === 'area_responsable' && c.activo);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(esquema),
    defaultValues: {
      fecha: hoyISO(),
      horaIngreso: horaAhora(),
      condicionApto: true,
      eppVerificado: true,
    },
  });

  const conductorId = watch('conductorId');
  const empresaId = watch('empresaId');
  const avisoId = watch('avisoId');

  const elegirConductor = (id: string) => {
    setValue('conductorId', Number(id) as never);
    const conductor = (conductores ?? []).find((c) => c.id === Number(id));
    if (conductor?.empresaId) setValue('empresaId', conductor.empresaId as never);
  };

  const elegirAviso = (id: string) => {
    setValue('avisoId', (id ? Number(id) : undefined) as never);
    const aviso = (avisosHoy ?? []).find((a) => a.id === Number(id));
    if (!aviso) return;
    if (aviso.empresaId) setValue('empresaId', aviso.empresaId as never);
    if (aviso.conductorId) setValue('conductorId', aviso.conductorId as never);
    if (aviso.patente) setValue('patente', aviso.patente);
    if (aviso.motivoId) setValue('motivoId', aviso.motivoId as never);
    if (aviso.areaResponsableId) setValue('areaResponsableId', aviso.areaResponsableId as never);
  };

  const guardar = useMutation({
    mutationFn: (datos: FormValues) =>
      api.post('/registros', {
        ...datos,
        motivoId: datos.motivoId || undefined,
        areaResponsableId: datos.areaResponsableId || undefined,
        avisoId: datos.avisoId || undefined,
        guiaDespacho: datos.guiaDespacho || undefined,
        observaciones: datos.observaciones || undefined,
      }),
    onSuccess: () => {
      toast.success('Ingreso registrado');
      queryClient.invalidateQueries({ queryKey: ['registros'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['avisos'] });
      navigate({ to: '/registros' });
    },
    onError: (e) => toast.error(e.message),
  });

  const avisoSeleccionado = (avisosHoy ?? []).find((a) => a.id === Number(avisoId));

  return (
    <>
      <PageHeader
        titulo="Registrar ingreso"
        descripcion="Formulario del protocolo de ingreso de transportistas"
      />

      <form onSubmit={handleSubmit((d) => guardar.mutate(d))} className="max-w-3xl space-y-6">
        {(avisosHoy ?? []).length > 0 && (
          <Card>
            <CardTitle className="mb-3">¿Viene anunciado?</CardTitle>
            <Label>Aviso pendiente de hoy</Label>
            <ComboboxBuscable
              opciones={(avisosHoy ?? []).map((a) => ({
                valor: String(a.id),
                label: `${a.horaEstimada ?? 's/h'} · ${a.empresa?.nombre ?? 'empresa s/i'} · ${a.patente ?? 's/patente'}${a.requiereSupervision ? ' ⚠ supervisión' : ''}`,
              }))}
              valor={avisoId ? String(avisoId) : ''}
              onCambio={elegirAviso}
              todasLabel="Sin aviso previo"
            />
            {avisoSeleccionado?.requiereSupervision && (
              <p className="mt-2">
                <Badge className="bg-red-100 text-red-700">
                  Esta descarga requiere supervisión presencial
                </Badge>
              </p>
            )}
          </Card>
        )}

        <Card>
          <CardTitle className="mb-3">Datos del ingreso</CardTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" type="date" {...register('fecha')} />
              <FieldError mensaje={errors.fecha?.message} />
            </div>
            <div>
              <Label htmlFor="horaIngreso">Hora de ingreso</Label>
              <Input id="horaIngreso" type="time" {...register('horaIngreso')} />
              <FieldError mensaje={errors.horaIngreso?.message} />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label>Conductor</Label>
                <button
                  type="button"
                  className="mb-1 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
                  onClick={() => setDialogoConductor(true)}
                >
                  <Plus className="size-3" /> Nuevo
                </button>
              </div>
              <ComboboxBuscable
                opciones={(conductores ?? []).map((c) => ({
                  valor: String(c.id),
                  label: `${c.nombre} (${c.rut})`,
                }))}
                valor={conductorId ? String(conductorId) : ''}
                onCambio={elegirConductor}
                todasLabel={null}
                placeholder="Buscar por nombre o RUT…"
              />
              <FieldError mensaje={errors.conductorId?.message} />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label>Empresa transportista</Label>
                <button
                  type="button"
                  className="mb-1 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
                  onClick={() => setDialogoEmpresa(true)}
                >
                  <Plus className="size-3" /> Nueva
                </button>
              </div>
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
              <Label htmlFor="patente">Patente</Label>
              <Input id="patente" placeholder="AB-CD-12" {...register('patente')} />
              <FieldError mensaje={errors.patente?.message} />
            </div>
            <div>
              <Label htmlFor="guiaDespacho">Guía de despacho / OC (opcional)</Label>
              <Input id="guiaDespacho" placeholder="N° de guía u orden" {...register('guiaDespacho')} />
            </div>
            <div>
              <Label htmlFor="motivoId">Motivo de visita</Label>
              <Select id="motivoId" {...register('motivoId')}>
                <option value="">Seleccionar…</option>
                {motivos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="areaResponsableId">Área responsable</Label>
              <Select id="areaResponsableId" {...register('areaResponsableId')}>
                <option value="">Seleccionar…</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-3">Checklist de seguridad (protocolo)</CardTitle>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" className="mt-1 size-4 accent-brand-600" {...register('condicionApto')} />
              <span className="text-sm text-forest-800">
                <span className="font-semibold">Conductor en condiciones aptas</span>
                <span className="block text-xs text-forest-400">
                  Sin signos evidentes de fatiga, consumo de alcohol, drogas o alteración.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" className="mt-1 size-4 accent-brand-600" {...register('eppVerificado')} />
              <span className="text-sm text-forest-800">
                <span className="font-semibold">EPP verificado</span>
                <span className="block text-xs text-forest-400">
                  Chaleco reflectante, calzado de seguridad, casco y guantes según corresponda.
                </span>
              </span>
            </label>
            <div>
              <Label htmlFor="observaciones">Observaciones (opcional)</Label>
              <Textarea id="observaciones" rows={2} {...register('observaciones')} />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate({ to: '/registros' })}>
            Cancelar
          </Button>
          <Button type="submit" variant="brand" size="lg" disabled={guardar.isPending}>
            {guardar.isPending ? 'Guardando…' : 'Registrar ingreso'}
          </Button>
        </div>
      </form>

      {dialogoConductor && (
        <DialogoNuevoConductor
          empresas={empresas ?? []}
          onClose={() => setDialogoConductor(false)}
          onCreado={(c) => {
            queryClient.invalidateQueries({ queryKey: ['conductores'] });
            setValue('conductorId', c.id as never);
            if (c.empresaId) setValue('empresaId', c.empresaId as never);
          }}
        />
      )}
      {dialogoEmpresa && (
        <DialogoNuevaEmpresa
          onClose={() => setDialogoEmpresa(false)}
          onCreada={(e) => {
            queryClient.invalidateQueries({ queryKey: ['empresas'] });
            setValue('empresaId', e.id as never);
          }}
        />
      )}
    </>
  );
}

const esquemaConductor = z.object({
  nombre: z.string().min(2, 'Requerido'),
  rut: z.string().min(7, 'RUT inválido'),
  telefono: z.string().optional(),
  empresaId: z.coerce.number().optional(),
});
type ConductorForm = z.infer<typeof esquemaConductor>;

function DialogoNuevoConductor({
  empresas,
  onClose,
  onCreado,
}: {
  empresas: Empresa[];
  onClose: () => void;
  onCreado: (c: Conductor) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConductorForm>({ resolver: zodResolver(esquemaConductor) });

  const crear = useMutation({
    mutationFn: (datos: ConductorForm) =>
      api.post<Conductor>('/conductores', {
        ...datos,
        telefono: datos.telefono || undefined,
        empresaId: datos.empresaId || undefined,
      }),
    onSuccess: (c) => {
      toast.success('Conductor creado');
      onCreado(c);
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onClose()}>
      <DialogContent title="Nuevo conductor">
        <form onSubmit={handleSubmit((d) => crear.mutate(d))} className="space-y-4">
          <div>
            <Label>Nombre completo</Label>
            <Input {...register('nombre')} />
            <FieldError mensaje={errors.nombre?.message} />
          </div>
          <div>
            <Label>RUT</Label>
            <Input placeholder="12.345.678-9" {...register('rut')} />
            <FieldError mensaje={errors.rut?.message} />
          </div>
          <div>
            <Label>Teléfono (opcional)</Label>
            <Input {...register('telefono')} />
          </div>
          <div>
            <Label>Empresa habitual (opcional)</Label>
            <Select {...register('empresaId')}>
              <option value="">Sin empresa</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="brand" disabled={crear.isPending}>
              {crear.isPending ? 'Creando…' : 'Crear conductor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const esquemaEmpresa = z.object({
  nombre: z.string().min(2, 'Requerido'),
  rut: z.string().optional(),
  contacto: z.string().optional(),
  telefono: z.string().optional(),
});
type EmpresaForm = z.infer<typeof esquemaEmpresa>;

function DialogoNuevaEmpresa({
  onClose,
  onCreada,
}: {
  onClose: () => void;
  onCreada: (e: Empresa) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmpresaForm>({ resolver: zodResolver(esquemaEmpresa) });

  const crear = useMutation({
    mutationFn: (datos: EmpresaForm) =>
      api.post<Empresa>('/empresas', {
        ...datos,
        rut: datos.rut || undefined,
        contacto: datos.contacto || undefined,
        telefono: datos.telefono || undefined,
      }),
    onSuccess: (e) => {
      toast.success('Empresa creada');
      onCreada(e);
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onClose()}>
      <DialogContent title="Nueva empresa transportista">
        <form onSubmit={handleSubmit((d) => crear.mutate(d))} className="space-y-4">
          <div>
            <Label>Nombre</Label>
            <Input {...register('nombre')} />
            <FieldError mensaje={errors.nombre?.message} />
          </div>
          <div>
            <Label>RUT (opcional)</Label>
            <Input {...register('rut')} />
          </div>
          <div>
            <Label>Contacto (opcional)</Label>
            <Input {...register('contacto')} />
          </div>
          <div>
            <Label>Teléfono (opcional)</Label>
            <Input {...register('telefono')} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="brand" disabled={crear.isPending}>
              {crear.isPending ? 'Creando…' : 'Crear empresa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
