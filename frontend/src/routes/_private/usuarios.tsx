import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FieldError, Input, Label, Select } from '@/components/ui/input';
import { PageHeader, Spinner } from '@/components/ui/misc';
import { Table, Td, Th, THead, Tr } from '@/components/ui/table';
import { api } from '@/lib/api';
import { ROL_LABEL } from '@/lib/format';
import type { Usuario } from '@/lib/types';
import { useAuthStore } from '@/stores/auth';

export const Route = createFileRoute('/_private/usuarios')({
  beforeLoad: () => {
    if (useAuthStore.getState().user?.rol !== 'admin') throw redirect({ to: '/dashboard' });
  },
  component: UsuariosPage,
});

const esquemaUsuario = z.object({
  nombre: z.string().min(2, 'Requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
  rol: z.enum(['admin', 'porteria', 'solicitante']),
});
type UsuarioForm = z.infer<typeof esquemaUsuario>;

function UsuariosPage() {
  const queryClient = useQueryClient();
  const [dialogo, setDialogo] = useState<{ usuario?: Usuario } | null>(null);

  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get<Usuario[]>('/users'),
  });

  const eliminar = useMutation({
    mutationFn: (id: number) => api.delete(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <Spinner />;

  return (
    <>
      <PageHeader titulo="Usuarios" descripcion="Cuentas de acceso a la plataforma y sus roles">
        <Button variant="brand" onClick={() => setDialogo({})}>
          <Plus /> Nuevo usuario
        </Button>
      </PageHeader>
      <Table>
        <THead>
          <tr>
            <Th>Nombre</Th>
            <Th>Email</Th>
            <Th>Rol</Th>
            <Th className="text-right">Acciones</Th>
          </tr>
        </THead>
        <tbody>
          {(usuarios ?? []).map((usuario) => (
            <Tr key={usuario.id}>
              <Td className="font-semibold">{usuario.nombre}</Td>
              <Td>{usuario.email}</Td>
              <Td>
                <Badge
                  className={
                    usuario.rol === 'admin'
                      ? 'bg-forest-800 text-white'
                      : usuario.rol === 'porteria'
                        ? 'bg-brand-100 text-brand-800'
                        : 'bg-forest-100 text-forest-600'
                  }
                >
                  {ROL_LABEL[usuario.rol] ?? usuario.rol}
                </Badge>
              </Td>
              <Td>
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setDialogo({ usuario })}>
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => {
                      if (confirm(`¿Eliminar al usuario ${usuario.email}?`)) {
                        eliminar.mutate(usuario.id);
                      }
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      {dialogo && (
        <DialogoUsuario
          usuario={dialogo.usuario}
          onClose={() => setDialogo(null)}
          onGuardado={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
        />
      )}
    </>
  );
}

function DialogoUsuario({
  usuario,
  onClose,
  onGuardado,
}: {
  usuario?: Usuario;
  onClose: () => void;
  onGuardado: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UsuarioForm>({
    resolver: zodResolver(esquemaUsuario),
    defaultValues: usuario
      ? { nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
      : { rol: 'porteria' },
  });

  const guardar = useMutation({
    mutationFn: (datos: UsuarioForm) => {
      const cuerpo: Record<string, unknown> = { ...datos };
      if (!datos.password) delete cuerpo.password;
      return usuario ? api.patch(`/users/${usuario.id}`, cuerpo) : api.post('/users', cuerpo);
    },
    onSuccess: () => {
      toast.success(usuario ? 'Usuario actualizado' : 'Usuario creado');
      onGuardado();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onClose()}>
      <DialogContent title={usuario ? `Editar ${usuario.nombre}` : 'Nuevo usuario'}>
        <form onSubmit={handleSubmit((d) => guardar.mutate(d))} className="space-y-4">
          <div>
            <Label>Nombre</Label>
            <Input {...register('nombre')} />
            <FieldError mensaje={errors.nombre?.message} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" {...register('email')} />
            <FieldError mensaje={errors.email?.message} />
          </div>
          <div>
            <Label>{usuario ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}</Label>
            <Input type="password" {...register('password')} />
            <FieldError mensaje={errors.password?.message} />
          </div>
          <div>
            <Label>Rol</Label>
            <Select {...register('rol')}>
              {Object.entries(ROL_LABEL).map(([valor, label]) => (
                <option key={valor} value={valor}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
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
