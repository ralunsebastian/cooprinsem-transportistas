import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { AlertTriangle, Bell, ClipboardList, Truck } from 'lucide-react';
import { useState } from 'react';
import { DialogoSalida } from '@/components/dialogo-salida';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { EmptyState, PageHeader, Spinner } from '@/components/ui/misc';
import { Table, Td, Th, THead, Tr } from '@/components/ui/table';
import { api } from '@/lib/api';
import { formatFecha } from '@/lib/format';
import type { DashboardResumen, Registro } from '@/lib/types';
import { useAuthStore } from '@/stores/auth';

export const Route = createFileRoute('/_private/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [salidaDe, setSalidaDe] = useState<Registro | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardResumen>('/dashboard'),
  });

  if (isLoading || !data) return <Spinner />;

  const puedeOperar = user?.rol === 'admin' || user?.rol === 'porteria';

  const stats = [
    { label: 'Camiones dentro ahora', valor: data.dentroAhora, icon: Truck, color: 'bg-brand-100 text-brand-700' },
    { label: 'Ingresos hoy', valor: data.ingresosHoy, icon: ClipboardList, color: 'bg-forest-100 text-forest-700' },
    { label: 'Avisos pendientes hoy', valor: data.avisosPendientesHoy, icon: Bell, color: 'bg-amber-100 text-amber-700' },
    { label: 'Incidencias del mes', valor: data.incidenciasMes, icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
  ];

  return (
    <>
      <PageHeader
        titulo={`Hola, ${user?.nombre?.split(' ')[0] ?? ''}`}
        descripcion="Estado del patio y recepción de camiones"
      >
        {puedeOperar && (
          <Link to="/registros/nuevo">
            <Button variant="brand">
              <Truck /> Registrar ingreso
            </Button>
          </Link>
        )}
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map(({ label, valor, icon: Icon, color }) => (
          <Card key={label} className="flex items-center gap-3.5">
            <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${color}`}>
              <Icon className="size-5" />
            </div>
            <div>
              <p className="font-display text-2xl leading-none font-bold text-forest-900">{valor}</p>
              <p className="mt-1 text-xs font-medium text-forest-400">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <CardTitle className="mb-3">Camiones en el recinto</CardTitle>
        {data.camionesDentro.length === 0 ? (
          <EmptyState icon={Truck} titulo="No hay camiones dentro" descripcion="Todos los ingresos registrados ya tienen salida." />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>Fecha</Th>
                <Th>Ingreso</Th>
                <Th>Conductor</Th>
                <Th>Empresa</Th>
                <Th>Patente</Th>
                <Th>Motivo</Th>
                <Th>Área</Th>
                {puedeOperar && <Th className="text-right">Acciones</Th>}
              </tr>
            </THead>
            <tbody>
              {data.camionesDentro.map((r) => (
                <Tr key={r.id}>
                  <Td>{formatFecha(r.fecha)}</Td>
                  <Td className="font-semibold">{r.horaIngreso}</Td>
                  <Td>{r.conductor?.nombre}</Td>
                  <Td>{r.empresa?.nombre}</Td>
                  <Td className="font-mono">{r.patente}</Td>
                  <Td>{r.motivo?.nombre ?? '—'}</Td>
                  <Td>{r.areaResponsable?.nombre ?? '—'}</Td>
                  {puedeOperar && (
                    <Td>
                      <div className="flex justify-end">
                        <Button size="sm" onClick={() => setSalidaDe(r)}>
                          Registrar salida
                        </Button>
                      </div>
                    </Td>
                  )}
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <div className="mt-6">
        <CardTitle className="mb-3">Avisos de camiones para hoy</CardTitle>
        {data.avisosHoy.length === 0 ? (
          <EmptyState icon={Bell} titulo="Sin avisos pendientes hoy" descripcion="Bodega y Abastecimiento no han anunciado más camiones para hoy." />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>Hora est.</Th>
                <Th>Empresa</Th>
                <Th>Patente</Th>
                <Th>Tonelaje</Th>
                <Th>Motivo</Th>
                <Th>Área</Th>
                <Th>Supervisión</Th>
              </tr>
            </THead>
            <tbody>
              {data.avisosHoy.map((a) => (
                <Tr key={a.id}>
                  <Td className="font-semibold">{a.horaEstimada ?? '—'}</Td>
                  <Td>{a.empresa?.nombre ?? '—'}</Td>
                  <Td className="font-mono">{a.patente ?? '—'}</Td>
                  <Td>{a.tonelaje ? `${a.tonelaje} t` : '—'}</Td>
                  <Td>{a.motivo?.nombre ?? '—'}</Td>
                  <Td>{a.areaResponsable?.nombre ?? '—'}</Td>
                  <Td>
                    {a.requiereSupervision ? (
                      <Badge className="bg-red-100 text-red-700">Requiere supervisión</Badge>
                    ) : (
                      '—'
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {salidaDe && (
        <DialogoSalida
          registro={salidaDe}
          onClose={() => setSalidaDe(null)}
          onGuardado={() => queryClient.invalidateQueries({ queryKey: ['dashboard'] })}
        />
      )}
    </>
  );
}
