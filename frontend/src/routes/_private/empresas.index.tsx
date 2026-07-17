import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Building2, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FieldError, Input, Label } from '@/components/ui/input';
import { EmptyState, PageHeader, Spinner } from '@/components/ui/misc';
import { Table, Td, Th, THead, Tr } from '@/components/ui/table';
import { api } from '@/lib/api';
import type { Empresa } from '@/lib/types';
import { useAuthStore } from '@/stores/auth';

export const Route = createFileRoute('/_private/empresas/')({
  component: EmpresasPage,
});

function EmpresasPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [dialogo, setDialogo] = useState<{ empresa?: Empresa } | null>(null);

  const { data: empresas, isLoading } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => api.get<Empresa[]>('/empresas'),
  });

  const puedeEditar = user?.rol === 'admin' || user?.rol === 'porteria';

  if (isLoading) return <Spinner />;

  return (
    <>
      <PageHeader
        titulo="Empresas transportistas"
        descripcion="Catálogo de empresas y su trazabilidad"
      >
        {puedeEditar && (
          <Button variant="brand" onClick={() => setDialogo({})}>
            <Plus /> Nueva empresa
          </Button>
        )}
      </PageHeader>

      {!empresas?.length ? (
        <EmptyState icon={Building2} titulo="Sin empresas registradas" />
      ) : (
        <Table>
          <THead>
            <tr>
              <Th>Nombre</Th>
              <Th>RUT</Th>
              <Th>Contacto</Th>
              <Th>Teléfono</Th>
              <Th>Estado</Th>
              <Th className="text-right">Acciones</Th>
            </tr>
          </THead>
          <tbody>
            {empresas.map((e) => (
              <Tr key={e.id}>
                <Td>
                  <Link
                    to="/empresas/$empresaId"
                    params={{ empresaId: String(e.id) }}
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    {e.nombre}
                  </Link>
                </Td>
                <Td>{e.rut ?? '—'}</Td>
                <Td>{e.contacto ?? '—'}</Td>
                <Td>{e.telefono ?? '—'}</Td>
                <Td>
                  <Badge
                    className={e.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'}
                  >
                    {e.activo ? 'Activa' : 'Inactiva'}
                  </Badge>
                </Td>
                <Td>
                  {puedeEditar && (
                    <div className="flex justify-end">
                      <Button variant="ghost" size="icon" onClick={() => setDialogo({ empresa: e })}>
                        <Pencil />
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
        <DialogoEmpresa
          empresa={dialogo.empresa}
          onClose={() => setDialogo(null)}
          onGuardada={() => queryClient.invalidateQueries({ queryKey: ['empresas'] })}
        />
      )}
    </>
  );
}

const esquemaEmpresa = z.object({
  nombre: z.string().min(2, 'Requerido'),
  rut: z.string().optional(),
  contacto: z.string().optional(),
  telefono: z.string().optional(),
  activo: z.boolean(),
});
type EmpresaForm = z.infer<typeof esquemaEmpresa>;

function DialogoEmpresa({
  empresa,
  onClose,
  onGuardada,
}: {
  empresa?: Empresa;
  onClose: () => void;
  onGuardada: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmpresaForm>({
    resolver: zodResolver(esquemaEmpresa),
    defaultValues: empresa
      ? {
          nombre: empresa.nombre,
          rut: empresa.rut ?? '',
          contacto: empresa.contacto ?? '',
          telefono: empresa.telefono ?? '',
          activo: empresa.activo,
        }
      : { activo: true },
  });

  const guardar = useMutation({
    mutationFn: (datos: EmpresaForm) => {
      const cuerpo = {
        ...datos,
        rut: datos.rut || undefined,
        contacto: datos.contacto || undefined,
        telefono: datos.telefono || undefined,
      };
      return empresa
        ? api.patch(`/empresas/${empresa.id}`, cuerpo)
        : api.post('/empresas', cuerpo);
    },
    onSuccess: () => {
      toast.success(empresa ? 'Empresa actualizada' : 'Empresa creada');
      onGuardada();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onClose()}>
      <DialogContent title={empresa ? `Editar ${empresa.nombre}` : 'Nueva empresa transportista'}>
        <form onSubmit={handleSubmit((d) => guardar.mutate(d))} className="space-y-4">
          <div>
            <Label>Nombre</Label>
            <Input {...register('nombre')} />
            <FieldError mensaje={errors.nombre?.message} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>RUT (opcional)</Label>
              <Input {...register('rut')} />
            </div>
            <div>
              <Label>Teléfono (opcional)</Label>
              <Input {...register('telefono')} />
            </div>
          </div>
          <div>
            <Label>Contacto (opcional)</Label>
            <Input {...register('contacto')} />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-forest-800">
            <input type="checkbox" className="size-4 accent-brand-600" {...register('activo')} />
            Empresa activa
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="brand" disabled={guardar.isPending}>
              {guardar.isPending ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
