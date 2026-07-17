import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface OpcionCombobox {
  valor: string;
  label: string;
}

/** Combobox con buscador: escribe para filtrar, clic para elegir. */
export function ComboboxBuscable({
  opciones,
  valor,
  onCambio,
  placeholder = 'Seleccionar…',
  todasLabel = 'Todas',
  className,
}: {
  opciones: OpcionCombobox[];
  valor: string;
  onCambio: (valor: string) => void;
  placeholder?: string;
  /** Etiqueta de la opción vacía (limpiar filtro). Pasa null para no ofrecerla. */
  todasLabel?: string | null;
  className?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const contenedorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!abierto) return;
    inputRef.current?.focus();
    const cerrar = (e: MouseEvent) => {
      if (!contenedorRef.current?.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener('mousedown', cerrar);
    return () => document.removeEventListener('mousedown', cerrar);
  }, [abierto]);

  const normalizar = (texto: string) =>
    texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const filtradas = opciones.filter((o) => normalizar(o.label).includes(normalizar(busqueda)));
  const seleccionada = opciones.find((o) => o.valor === valor);

  const elegir = (nuevoValor: string) => {
    onCambio(nuevoValor);
    setAbierto(false);
    setBusqueda('');
  };

  return (
    <div ref={contenedorRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-forest-200 bg-white px-3 text-sm text-forest-900 focus:border-brand-400 focus:outline-2 focus:outline-brand-200"
      >
        <span className={cn('truncate', !seleccionada && 'text-forest-400')}>
          {seleccionada?.label ?? (todasLabel || placeholder)}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-forest-300" />
      </button>

      {abierto && (
        <div className="absolute z-50 mt-1 w-full min-w-56 overflow-hidden rounded-xl border border-forest-100 bg-white shadow-xl">
          <div className="flex items-center gap-2 border-b border-forest-50 px-3">
            <Search className="size-4 shrink-0 text-forest-300" />
            <input
              ref={inputRef}
              className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-forest-300"
              placeholder="Buscar…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setAbierto(false);
                if (e.key === 'Enter' && filtradas.length === 1) elegir(filtradas[0].valor);
              }}
            />
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {todasLabel && !busqueda && (
              <li>
                <button
                  type="button"
                  onClick={() => elegir('')}
                  className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm text-forest-500 hover:bg-forest-50"
                >
                  {todasLabel}
                  {valor === '' && <Check className="size-4 text-brand-600" />}
                </button>
              </li>
            )}
            {filtradas.length === 0 ? (
              <li className="px-3 py-3 text-center text-sm text-forest-300">Sin resultados</li>
            ) : (
              filtradas.map((opcion) => (
                <li key={opcion.valor}>
                  <button
                    type="button"
                    onClick={() => elegir(opcion.valor)}
                    className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm text-forest-800 hover:bg-brand-50"
                  >
                    <span className="truncate">{opcion.label}</span>
                    {valor === opcion.valor && <Check className="size-4 shrink-0 text-brand-600" />}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
