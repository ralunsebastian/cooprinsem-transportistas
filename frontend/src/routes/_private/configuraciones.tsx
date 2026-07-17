import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { PageHeader, Spinner } from '@/components/ui/misc';
import { Table, Td, Th, THead, Tr } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import type { CategoriaCatalogo, Configuracion, OpcionCatalogo } from '@/lib/types';
import { useAuthStore } from '@/stores/auth';

export const Route = createFileRoute('/_private/configuraciones')({
  beforeLoad: () => {
    if (useAuthStore.getState().user?.rol !== 'admin') throw redirect({ to: '/dashboard' });
  },
  component: ConfiguracionesPage,
});

const CATEGORIAS: { valor: CategoriaCatalogo; label: string }[] = [
  { valor: 'motivo_visita', label: 'Motivos de visita' },
  { valor: 'area_responsable', label: 'Áreas responsables' },
  { valor: 'tipo_incidencia', label: 'Tipos de incidencia' },
];

function ConfiguracionesPage() {
  return (
    <>
      <PageHeader titulo="Configuraciones" descripcion="Catálogos y parámetros de la plataforma" />
      <Tabs defaultValue="catalogos">
        <TabsList>
          <TabsTrigger value="catalogos">Catálogos</TabsTrigger>
          <TabsTrigger value="parametros">Parámetros</TabsTrigger>
        </TabsList>
        <TabsContent value="catalogos">
          <TabCatalogos />
        </TabsContent>
        <TabsContent value="parametros">
          <TabParametros />
        </TabsContent>
      </Tabs>
    </>
  );
}

function TabCatalogos() {
  const queryClient = useQueryClient();
  const [nuevo, setNuevo] = useState<Record<string, string>>({});

  const { data: catalogos, isLoading } = useQuery({
    queryKey: ['catalogos'],
    queryFn: () => api.get<OpcionCatalogo[]>('/catalogos'),
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['catalogos'] });

  const crear = useMutation({
    mutationFn: ({ categoria, nombre }: { categoria: CategoriaCatalogo; nombre: string }) =>
      api.post('/catalogos', { categoria, nombre }),
    onSuccess: invalidar,
    onError: (e) => toast.error(e.message),
  });

  const alternar = useMutation({
    mutationFn: (opcion: OpcionCatalogo) =>
      api.patch(`/catalogos/${opcion.id}`, { activo: !opcion.activo }),
    onSuccess: invalidar,
    onError: (e) => toast.error(e.message),
  });

  const eliminar = useMutation({
    mutationFn: (id: number) => api.delete(`/catalogos/${id}`),
    onSuccess: invalidar,
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <Spinner />;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {CATEGORIAS.map(({ valor, label }) => {
        const opciones = (catalogos ?? []).filter((c) => c.categoria === valor);
        return (
          <div key={valor} className="rounded-2xl bg-white p-4 shadow-card">
            <h3 className="font-display mb-3 font-semibold text-forest-900">{label}</h3>
            <ul className="space-y-1.5">
              {opciones.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-forest-50/60 px-3 py-1.5 text-sm"
                >
                  <span className={o.activo ? '' : 'text-forest-300 line-through'}>{o.nombre}</span>
                  <span className="flex items-center gap-1">
                    <button
                      className="cursor-pointer rounded p-1 text-forest-400 hover:bg-forest-100"
                      title={o.activo ? 'Desactivar' : 'Activar'}
                      onClick={() => alternar.mutate(o)}
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      className="cursor-pointer rounded p-1 text-red-400 hover:bg-red-50"
                      title="Eliminar"
                      onClick={() => {
                        if (confirm(`¿Eliminar "${o.nombre}"?`)) eliminar.mutate(o.id);
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="Nueva opción…"
                value={nuevo[valor] ?? ''}
                onChange={(e) => setNuevo((n) => ({ ...n, [valor]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (nuevo[valor] ?? '').trim()) {
                    crear.mutate({ categoria: valor, nombre: nuevo[valor].trim() });
                    setNuevo((n) => ({ ...n, [valor]: '' }));
                  }
                }}
              />
              <Button
                size="icon"
                variant="outline"
                disabled={!(nuevo[valor] ?? '').trim()}
                onClick={() => {
                  crear.mutate({ categoria: valor, nombre: nuevo[valor].trim() });
                  setNuevo((n) => ({ ...n, [valor]: '' }));
                }}
              >
                <Plus />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TabParametros() {
  const queryClient = useQueryClient();
  const [editando, setEditando] = useState<Record<string, string>>({});

  const { data: config, isLoading } = useQuery({
    queryKey: ['configuracion'],
    queryFn: () => api.get<Configuracion[]>('/configuracion'),
  });

  const guardar = useMutation({
    mutationFn: ({ clave, valor }: { clave: string; valor: string }) =>
      api.patch(`/configuracion/${clave}`, { valor }),
    onSuccess: () => {
      toast.success('Parámetro actualizado');
      queryClient.invalidateQueries({ queryKey: ['configuracion'] });
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <Spinner />;

  return (
    <Table>
      <THead>
        <tr>
          <Th>Clave</Th>
          <Th>Valor</Th>
          <Th className="text-right">Acciones</Th>
        </tr>
      </THead>
      <tbody>
        {(config ?? []).map((c) => {
          const enEdicion = editando[c.clave] !== undefined;
          return (
            <Tr key={c.clave}>
              <Td className="align-top">
                <Badge className="bg-forest-100 text-forest-700">{c.clave}</Badge>
                {c.descripcion && (
                  <p className="mt-1 max-w-xs text-xs text-forest-400">{c.descripcion}</p>
                )}
              </Td>
              <Td className="max-w-lg">
                {enEdicion ? (
                  <Textarea
                    rows={2}
                    value={editando[c.clave]}
                    onChange={(e) => setEditando((s) => ({ ...s, [c.clave]: e.target.value }))}
                  />
                ) : (
                  <span className="text-sm break-words whitespace-pre-wrap">{c.valor}</span>
                )}
              </Td>
              <Td>
                <div className="flex justify-end gap-1">
                  {enEdicion ? (
                    <Button
                      size="sm"
                      variant="brand"
                      onClick={() => {
                        guardar.mutate({ clave: c.clave, valor: editando[c.clave] });
                        setEditando(({ [c.clave]: _, ...resto }) => resto);
                      }}
                    >
                      <Save /> Guardar
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditando((s) => ({ ...s, [c.clave]: c.valor }))}
                    >
                      <Pencil />
                    </Button>
                  )}
                </div>
              </Td>
            </Tr>
          );
        })}
      </tbody>
    </Table>
  );
}
