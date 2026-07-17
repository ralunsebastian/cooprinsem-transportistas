import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ClipboardList, Download, Plus } from 'lucide-react';
import { useState } from 'react';
import { DialogoSalida } from '@/components/dialogo-salida';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ComboboxBuscable } from '@/components/ui/combobox';
import { Input, Label, Select } from '@/components/ui/input';
import { EmptyState, PageHeader, Spinner } from '@/components/ui/misc';
import { Table, Td, Th, THead, Tr } from '@/components/ui/table';
import { api } from '@/lib/api';
import { exportarCsv } from '@/lib/csv';
import { formatFecha } from '@/lib/format';
import type { Empresa, Registro } from '@/lib/types';
import { useAuthStore } from '@/stores/auth';

export const Route = createFileRoute('/_private/registros/')({
  component: RegistrosPage,
});

function RegistrosPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [salidaDe, setSalidaDe] = useState<Registro | null>(null);
  const [filtros, setFiltros] = useState({
    desde: '',
    hasta: '',
    empresaId: '',
    patente: '',
    dentro: '',
  });

  const params = new URLSearchParams();
  if (filtros.desde) params.set('desde', filtros.desde);
  if (filtros.hasta) params.set('hasta', filtros.hasta);
  if (filtros.empresaId) params.set('empresaId', filtros.empresaId);
  if (filtros.patente) params.set('patente', filtros.patente);
  if (filtros.dentro) params.set('dentro', 'true');

  const { data: registros, isLoading } = useQuery({
    queryKey: ['registros', params.toString()],
    queryFn: () => api.get<Registro[]>(`/registros?${params.toString()}`),
  });

  const { data: empresas } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => api.get<Empresa[]>('/empresas'),
  });

  const puedeOperar = user?.rol === 'admin' || user?.rol === 'porteria';

  const exportar = () => {
    exportarCsv(
      'registros-transportistas',
      (registros ?? []).map((r) => ({
        Fecha: formatFecha(r.fecha),
        'Hora ingreso': r.horaIngreso,
        'Hora salida': r.horaSalida ?? '',
        Conductor: r.conductor?.nombre ?? '',
        RUT: r.conductor?.rut ?? '',
        Empresa: r.empresa?.nombre ?? '',
        Patente: r.patente,
        Motivo: r.motivo?.nombre ?? '',
        'Área responsable': r.areaResponsable?.nombre ?? '',
        'Guía despacho': r.guiaDespacho ?? '',
        'Condición apto': r.condicionApto ? 'Sí' : 'No',
        'EPP verificado': r.eppVerificado ? 'Sí' : 'No',
        'Con aviso': r.avisoId ? 'Sí' : 'No',
        Observaciones: r.observaciones ?? '',
      })),
    );
  };

  return (
    <>
      <PageHeader
        titulo="Registros de ingreso"
        descripcion="Historial de ingresos y salidas de transportistas"
      >
        <Button variant="outline" onClick={exportar} disabled={!registros?.length}>
          <Download /> Exportar CSV
        </Button>
        {puedeOperar && (
          <Link to="/registros/nuevo">
            <Button variant="brand">
              <Plus /> Registrar ingreso
            </Button>
          </Link>
        )}
      </PageHeader>

      <div className="mb-4 grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 shadow-card md:grid-cols-5">
        <div>
          <Label>Desde</Label>
          <Input
            type="date"
            value={filtros.desde}
            onChange={(e) => setFiltros((f) => ({ ...f, desde: e.target.value }))}
          />
        </div>
        <div>
          <Label>Hasta</Label>
          <Input
            type="date"
            value={filtros.hasta}
            onChange={(e) => setFiltros((f) => ({ ...f, hasta: e.target.value }))}
          />
        </div>
        <div>
          <Label>Empresa</Label>
          <ComboboxBuscable
            opciones={(empresas ?? []).map((e) => ({ valor: String(e.id), label: e.nombre }))}
            valor={filtros.empresaId}
            onCambio={(v) => setFiltros((f) => ({ ...f, empresaId: v }))}
          />
        </div>
        <div>
          <Label>Patente</Label>
          <Input
            placeholder="AB-CD-12"
            value={filtros.patente}
            onChange={(e) => setFiltros((f) => ({ ...f, patente: e.target.value }))}
          />
        </div>
        <div>
          <Label>Estado</Label>
          <Select
            value={filtros.dentro}
            onChange={(e) => setFiltros((f) => ({ ...f, dentro: e.target.value }))}
          >
            <option value="">Todos</option>
            <option value="true">Dentro del recinto</option>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !registros?.length ? (
        <EmptyState
          icon={ClipboardList}
          titulo="Sin registros"
          descripcion="No hay ingresos que coincidan con los filtros."
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <Th>Fecha</Th>
              <Th>Ingreso</Th>
              <Th>Salida</Th>
              <Th>Conductor</Th>
              <Th>Empresa</Th>
              <Th>Patente</Th>
              <Th>Motivo</Th>
              <Th>Área</Th>
              <Th>Checklist</Th>
              {puedeOperar && <Th className="text-right">Acciones</Th>}
            </tr>
          </THead>
          <tbody>
            {registros.map((r) => (
              <Tr key={r.id}>
                <Td>{formatFecha(r.fecha)}</Td>
                <Td className="font-semibold">{r.horaIngreso}</Td>
                <Td>
                  {r.horaSalida ?? (
                    <Badge className="bg-brand-100 text-brand-800">Dentro</Badge>
                  )}
                </Td>
                <Td>
                  <span className="font-medium">{r.conductor?.nombre}</span>
                  <span className="block text-xs text-forest-400">{r.conductor?.rut}</span>
                </Td>
                <Td>{r.empresa?.nombre}</Td>
                <Td className="font-mono">{r.patente}</Td>
                <Td>{r.motivo?.nombre ?? '—'}</Td>
                <Td>{r.areaResponsable?.nombre ?? '—'}</Td>
                <Td>
                  {!r.condicionApto && (
                    <Badge className="mr-1 bg-red-100 text-red-700">No apto</Badge>
                  )}
                  {!r.eppVerificado && (
                    <Badge className="bg-amber-100 text-amber-800">Sin EPP</Badge>
                  )}
                  {r.condicionApto && r.eppVerificado && (
                    <Badge className="bg-emerald-100 text-emerald-800">OK</Badge>
                  )}
                </Td>
                {puedeOperar && (
                  <Td>
                    <div className="flex justify-end">
                      {!r.horaSalida && (
                        <Button size="sm" variant="outline" onClick={() => setSalidaDe(r)}>
                          Registrar salida
                        </Button>
                      )}
                    </div>
                  </Td>
                )}
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      {salidaDe && (
        <DialogoSalida
          registro={salidaDe}
          onClose={() => setSalidaDe(null)}
          onGuardado={() => queryClient.invalidateQueries({ queryKey: ['registros'] })}
        />
      )}
    </>
  );
}
