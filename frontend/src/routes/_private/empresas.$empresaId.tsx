import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { AlertTriangle, ArrowLeft, ClipboardList } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardTitle } from '@/components/ui/card';
import { EmptyState, PageHeader, Spinner } from '@/components/ui/misc';
import { Table, Td, Th, THead, Tr } from '@/components/ui/table';
import { api } from '@/lib/api';
import { formatFecha, SEVERIDAD } from '@/lib/format';
import type { FichaEmpresa } from '@/lib/types';

export const Route = createFileRoute('/_private/empresas/$empresaId')({
  component: FichaEmpresaPage,
});

function FichaEmpresaPage() {
  const { empresaId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['empresas', empresaId, 'ficha'],
    queryFn: () => api.get<FichaEmpresa>(`/empresas/${empresaId}/ficha`),
  });

  if (isLoading || !data) return <Spinner />;

  const { empresa, registros, incidencias } = data;
  const graves = incidencias.filter((i) => i.severidad === 'grave').length;

  return (
    <>
      <Link
        to="/empresas"
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-forest-500 hover:text-forest-800"
      >
        <ArrowLeft className="size-4" /> Volver a empresas
      </Link>
      <PageHeader titulo={empresa.nombre} descripcion={empresa.rut ?? 'Sin RUT registrado'} />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Card>
          <p className="font-display text-2xl font-bold text-forest-900">{registros.length}</p>
          <p className="mt-1 text-xs font-medium text-forest-400">Ingresos (últimos 100)</p>
        </Card>
        <Card>
          <p className="font-display text-2xl font-bold text-forest-900">{incidencias.length}</p>
          <p className="mt-1 text-xs font-medium text-forest-400">Incidencias totales</p>
        </Card>
        <Card>
          <p className="font-display text-2xl font-bold text-red-600">{graves}</p>
          <p className="mt-1 text-xs font-medium text-forest-400">Incidencias graves</p>
        </Card>
        <Card>
          <p className="font-display text-2xl font-bold text-forest-900">
            {empresa.telefono ?? '—'}
          </p>
          <p className="mt-1 text-xs font-medium text-forest-400">
            Contacto: {empresa.contacto ?? '—'}
          </p>
        </Card>
      </div>

      <div className="mt-6">
        <CardTitle className="mb-3">Incidencias</CardTitle>
        {incidencias.length === 0 ? (
          <EmptyState icon={AlertTriangle} titulo="Sin incidencias registradas" />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>Fecha</Th>
                <Th>Conductor</Th>
                <Th>Tipo</Th>
                <Th>Severidad</Th>
                <Th>Descripción</Th>
              </tr>
            </THead>
            <tbody>
              {incidencias.map((i) => (
                <Tr key={i.id}>
                  <Td>{formatFecha(i.fecha)}</Td>
                  <Td>{i.conductor?.nombre ?? '—'}</Td>
                  <Td>{i.tipo?.nombre ?? '—'}</Td>
                  <Td>
                    <Badge className={SEVERIDAD[i.severidad].badge}>
                      {SEVERIDAD[i.severidad].label}
                    </Badge>
                  </Td>
                  <Td className="max-w-md">{i.descripcion}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <div className="mt-6">
        <CardTitle className="mb-3">Historial de ingresos</CardTitle>
        {registros.length === 0 ? (
          <EmptyState icon={ClipboardList} titulo="Sin ingresos registrados" />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>Fecha</Th>
                <Th>Ingreso</Th>
                <Th>Salida</Th>
                <Th>Conductor</Th>
                <Th>Patente</Th>
                <Th>Motivo</Th>
                <Th>Área</Th>
              </tr>
            </THead>
            <tbody>
              {registros.map((r) => (
                <Tr key={r.id}>
                  <Td>{formatFecha(r.fecha)}</Td>
                  <Td className="font-semibold">{r.horaIngreso}</Td>
                  <Td>
                    {r.horaSalida ?? <Badge className="bg-brand-100 text-brand-800">Dentro</Badge>}
                  </Td>
                  <Td>{r.conductor?.nombre}</Td>
                  <Td className="font-mono">{r.patente}</Td>
                  <Td>{r.motivo?.nombre ?? '—'}</Td>
                  <Td>{r.areaResponsable?.nombre ?? '—'}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </>
  );
}
