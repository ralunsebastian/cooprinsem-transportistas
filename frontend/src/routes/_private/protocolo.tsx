import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import {
  AlertTriangle,
  ClipboardCheck,
  DoorOpen,
  HardHat,
  ShieldCheck,
  Siren,
  Truck,
  Users,
} from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/misc';
import { api } from '@/lib/api';
import type { Configuracion } from '@/lib/types';

export const Route = createFileRoute('/_private/protocolo')({
  component: ProtocoloPage,
});

const SECCIONES = [
  {
    icon: ShieldCheck,
    titulo: '1. Alcance',
    items: [
      'Aplica a todo conductor de camión, proveedor, transportista, ayudante o tercero que ingrese a las dependencias para entregar, retirar, cargar o descargar productos, materiales, insumos o residuos.',
    ],
  },
  {
    icon: AlertTriangle,
    titulo: '2. Riesgos principales a controlar',
    items: [
      'Atropellos o golpes por movimiento de camiones, grúas horquilla u otros equipos móviles.',
      'Caídas al mismo o distinto nivel al subir o bajar del camión, circular por patios o acceder a zonas de carga.',
      'Atrapamientos durante maniobras de carga, descarga, apertura de puertas, uso de ramplas o manipulación de elementos.',
      'Volcamientos, choques o colisiones por exceso de velocidad, mala visibilidad o maniobras no autorizadas.',
      'Sobreesfuerzos, cortes, golpes o exposición a materiales peligrosos durante la manipulación de carga.',
    ],
  },
  {
    icon: ClipboardCheck,
    titulo: '3. Requisitos antes del ingreso',
    items: [
      'El conductor debe anunciarse en portería, con los encargados de patio o en el punto de control designado.',
      'Debe presentar identificación, nombre de la empresa transportista, patente del camión y guía de despacho u orden correspondiente.',
      'Se debe registrar hora de ingreso, motivo de visita y área de destino.',
      'El conductor debe encontrarse en condiciones aptas para conducir y operar, sin signos evidentes de fatiga, consumo de alcohol, drogas o alteración.',
    ],
  },
  {
    icon: HardHat,
    titulo: '4. Elementos de protección personal obligatorios',
    items: [
      'Chaleco reflectante o ropa de alta visibilidad.',
      'Zapatos de seguridad o calzado cerrado antideslizante, según corresponda.',
      'Casco de seguridad en zonas de carga, descarga, bodega o patio operativo, según corresponda.',
      'Guantes de seguridad cuando exista manipulación de carga, puertas, amarras o elementos con riesgo de corte o golpe.',
    ],
  },
  {
    icon: Truck,
    titulo: '5. Normas de circulación dentro de la empresa',
    items: [
      'Respetar siempre la velocidad máxima señalizada. Si no existe señalización, circular a velocidad reducida y prudente.',
      'Transitar únicamente por las rutas autorizadas y señalizadas para camiones.',
      'No utilizar teléfono celular ni dispositivos distractores mientras conduce dentro de la empresa.',
      'Mantener luces encendidas cuando las condiciones de visibilidad lo requieran.',
      'Dar preferencia a peatones, equipos móviles y personal autorizado en zonas operativas.',
      'Realizar maniobras de retroceso solo cuando sea necesario, con apoyo de señalero si existe visibilidad limitada.',
      'No estacionar ni detenerse en accesos, salidas de emergencia, pasos peatonales, zonas de grúa horquilla, extintores o vías de evacuación.',
    ],
  },
  {
    icon: ClipboardCheck,
    titulo: '6. Procedimiento de carga y descarga',
    items: [
      'El conductor debe ubicarse solo en el sector indicado por el personal responsable.',
      'Si la operación lo requiere, se deben instalar cuñas en las ruedas.',
      'El conductor no debe permanecer en zonas de maniobra de grúa horquilla, bajo carga suspendida ni entre el camión y estructuras fijas.',
      'El conductor debe esperar instrucciones del encargado del área antes de abrir puertas, retirar amarras, subir a la carrocería o mover el vehículo.',
      'Queda prohibido subir o bajar del camión mientras este se encuentre en movimiento.',
      'La carga debe quedar correctamente estibada, distribuida y asegurada antes de autorizar la salida.',
    ],
  },
  {
    icon: AlertTriangle,
    titulo: '7. Conductas prohibidas',
    items: [
      'Ingresar sin autorización o sin registro previo.',
      'Conducir a exceso de velocidad o fuera de las rutas autorizadas.',
      'Realizar maniobras riesgosas, bruscas o no coordinadas.',
      'Fumar, comer o manipular elementos no autorizados en zonas operativas, bodegas o áreas restringidas.',
      'Ingresar bajo efectos de alcohol, drogas o medicamentos que afecten la conducción.',
    ],
  },
  {
    icon: Users,
    titulo: '8. Responsabilidades',
    items: [
      'Portería o recepción: registrar el ingreso y salida, verificar antecedentes básicos e informar al área responsable.',
      'Área solicitante o encargada de carga/descarga: indicar el lugar de estacionamiento, supervisar la operación y asegurar que se cumplan las medidas de seguridad.',
      'Conductor: cumplir este protocolo, respetar instrucciones, usar los elementos de protección personal y reportar cualquier condición insegura.',
      'Empresa transportista: asegurar que sus conductores cuenten con licencia vigente, capacitación básica, vehículos en buen estado y documentación correspondiente.',
    ],
  },
  {
    icon: Siren,
    titulo: '9. Medidas ante emergencias o accidentes',
    items: [
      'Detener inmediatamente la operación y apagar el motor del vehículo si es seguro hacerlo.',
      'Informar de inmediato a portería, supervisor o encargado del área.',
      'No mover lesionados salvo que exista riesgo mayor e inminente.',
      'Aislar el área para evitar nuevos accidentes.',
    ],
  },
  {
    icon: DoorOpen,
    titulo: '10. Control de salida',
    items: [
      'Antes de salir, el conductor debe contar con autorización del área responsable.',
      'Portería o recepción debe registrar hora de salida y verificar documentación de retiro o entrega, cuando corresponda.',
      'El conductor debe salir por la ruta indicada, respetando velocidad, señalización y prioridad peatonal.',
      'Si se detecta una condición insegura en el camión o en la carga, se debe detener la salida hasta corregirla o recibir autorización formal.',
    ],
  },
];

function ProtocoloPage() {
  const { data: config } = useQuery({
    queryKey: ['configuracion'],
    queryFn: () => api.get<Configuracion[]>('/configuracion'),
    staleTime: 5 * 60_000,
  });
  const valor = (clave: string) => config?.find((c) => c.clave === clave)?.valor;

  return (
    <>
      <PageHeader
        titulo="Protocolo de Ingreso de Transportistas"
        descripcion={`${valor('sucursal.direccion') ?? 'Manuel Rodríguez 1040, Osorno'} — Comité Paritario de Higiene y Seguridad`}
      />

      <Card className="mb-6 border-l-4 border-brand-500">
        <CardTitle>Objetivo</CardTitle>
        <p className="mt-2 text-sm text-forest-700">
          Establecer medidas mínimas de control para el ingreso, permanencia, circulación, carga,
          descarga y salida de transportistas externos, con el fin de proteger a trabajadores,
          clientes y conductores ante eventuales accidentes.
        </p>
        {valor('protocolo.horario_recepcion') && (
          <p className="mt-2 text-sm text-forest-500">
            <span className="font-semibold">Horario habitual de recepción:</span>{' '}
            {valor('protocolo.horario_recepcion')}
          </p>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {SECCIONES.map((s) => (
          <Card key={s.titulo}>
            <div className="mb-2 flex items-center gap-2.5">
              <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50">
                <s.icon className="size-4 text-brand-600" />
              </div>
              <CardTitle>{s.titulo}</CardTitle>
            </div>
            <ul className="ml-1 list-disc space-y-1.5 pl-4 text-sm text-forest-700">
              {s.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}
