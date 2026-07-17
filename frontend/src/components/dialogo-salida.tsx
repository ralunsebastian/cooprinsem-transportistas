import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input, Label, Textarea } from '@/components/ui/input';
import { api } from '@/lib/api';
import { horaAhora } from '@/lib/format';
import type { Registro } from '@/lib/types';

export function DialogoSalida({
  registro,
  onClose,
  onGuardado,
}: {
  registro: Registro;
  onClose: () => void;
  onGuardado?: () => void;
}) {
  const queryClient = useQueryClient();
  const [horaSalida, setHoraSalida] = useState(horaAhora());
  const [observaciones, setObservaciones] = useState('');

  const guardar = useMutation({
    mutationFn: () =>
      api.patch(`/registros/${registro.id}/salida`, {
        horaSalida,
        observaciones: observaciones || undefined,
      }),
    onSuccess: () => {
      toast.success('Salida registrada');
      queryClient.invalidateQueries({ queryKey: ['registros'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onGuardado?.();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onClose()}>
      <DialogContent title={`Registrar salida — ${registro.patente}`}>
        <div className="space-y-4">
          <p className="text-sm text-forest-500">
            {registro.conductor?.nombre} · {registro.empresa?.nombre} · ingresó a las{' '}
            {registro.horaIngreso}
          </p>
          <div>
            <Label htmlFor="horaSalida">Hora de salida</Label>
            <Input
              id="horaSalida"
              type="time"
              value={horaSalida}
              onChange={(e) => setHoraSalida(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="obsSalida">Observaciones (opcional)</Label>
            <Textarea
              id="obsSalida"
              rows={2}
              placeholder="Condición de la carga, documentación, etc."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="brand" disabled={guardar.isPending} onClick={() => guardar.mutate()}>
              {guardar.isPending ? 'Guardando…' : 'Registrar salida'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
