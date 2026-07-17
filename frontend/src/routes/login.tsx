import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Truck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { FieldError, Input, Label } from '@/components/ui/input';
import { api } from '@/lib/api';
import type { Usuario } from '@/lib/types';
import { useAuthStore } from '@/stores/auth';

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    if (useAuthStore.getState().token) throw redirect({ to: '/dashboard' });
  },
  component: LoginPage,
});

const esquema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(4, 'Mínimo 4 caracteres'),
});
type FormValues = z.infer<typeof esquema>;

function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(esquema) });

  const login = useMutation({
    mutationFn: (datos: FormValues) =>
      api.post<{ token: string; user: Usuario }>('/auth/login', datos),
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
      navigate({ to: '/dashboard' });
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="flex min-h-screen">
      {/* Panel de marca */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-forest-900 p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(60rem 30rem at 120% 110%, var(--color-brand-500) 0%, transparent 55%), radial-gradient(40rem 20rem at -20% -10%, var(--color-forest-600) 0%, transparent 60%)',
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <div className="grid size-10 place-items-center rounded-xl bg-brand-500">
            <Truck className="size-6 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-white">Cooprinsem</span>
        </div>
        <div className="relative max-w-md">
          <h1 className="font-display text-4xl leading-tight font-bold text-white">
            Registro de ingreso de transportistas
          </h1>
          <p className="mt-4 text-forest-200">
            Control de ingreso, permanencia y salida de camiones en la sucursal Manuel Rodríguez
            1040, Osorno. Avisos previos, checklist de seguridad y trazabilidad de incidencias.
          </p>
        </div>
        <p className="relative text-xs text-forest-400">
          © {new Date().getFullYear()} Cooprinsem — Comité Paritario de Higiene y Seguridad
        </p>
      </div>

      {/* Formulario */}
      <div className="flex flex-1 items-center justify-center bg-surface p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="grid size-10 place-items-center rounded-xl bg-brand-500">
              <Truck className="size-6 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-forest-900">Cooprinsem</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-forest-900">Iniciar sesión</h2>
          <p className="mt-1 mb-6 text-sm text-forest-400">Ingresa con tu cuenta de la plataforma</p>

          <form onSubmit={handleSubmit((d) => login.mutate(d))} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="correo@cooprinsem.cl" {...register('email')} />
              <FieldError mensaje={errors.email?.message} />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
              <FieldError mensaje={errors.password?.message} />
            </div>
            <Button type="submit" variant="brand" size="lg" className="w-full" disabled={login.isPending}>
              {login.isPending ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
