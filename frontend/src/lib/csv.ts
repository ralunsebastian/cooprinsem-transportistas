/** Descarga un arreglo de objetos como CSV compatible con Excel (BOM UTF-8, separador ;). */
export function exportarCsv<T extends object>(nombreArchivo: string, filas: T[]) {
  if (filas.length === 0) return;
  const columnas = Object.keys(filas[0]) as (keyof T & string)[];
  const escapar = (valor: unknown) => {
    const texto = valor === null || valor === undefined ? '' : String(valor);
    return /[";\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  };
  const lineas = [
    columnas.join(';'),
    ...filas.map((fila) => columnas.map((c) => escapar((fila as Record<string, unknown>)[c])).join(';')),
  ];
  const blob = new Blob([`﻿${lineas.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `${nombreArchivo}-${new Date().toISOString().slice(0, 10)}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);
}
