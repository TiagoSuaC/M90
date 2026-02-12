"use client";

import { useState } from "react";
import { useActionState } from "react";
import { createMeasurement } from "@/lib/actions/measurements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Measurement {
  id: string;
  measurementDate: string;
  weightKg: number;
  fatPercentage: number | null;
  leanMassKg: number | null;
  notes: string | null;
  createdAt: string;
}

interface MeasurementsTabProps {
  patientId: string;
  measurements: Measurement[];
}

function toNum(val: number | null): number | null {
  if (val === null) return null;
  return Number(val);
}

export function MeasurementsTab({
  patientId,
  measurements,
}: MeasurementsTabProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_prev: any, formData: FormData) => {
      const result = await createMeasurement(formData);
      if (result?.success) setOpen(false);
      return result;
    },
    null
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Pesagens / Medidas</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Nova Pesagem
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Pesagem</DialogTitle>
              <DialogDescription>Preencha os dados da pesagem realizada</DialogDescription>
            </DialogHeader>
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="patientId" value={patientId} />
              {state?.error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {state.error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="measurementDate">Data</Label>
                <Input
                  id="measurementDate"
                  name="measurementDate"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weightKg">Peso (kg)</Label>
                <Input
                  id="weightKg"
                  name="weightKg"
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fatPercentage">Gordura (%)</Label>
                  <Input
                    id="fatPercentage"
                    name="fatPercentage"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leanMassKg">Massa magra (kg)</Label>
                  <Input
                    id="leanMassKg"
                    name="leanMassKg"
                    type="number"
                    step="0.1"
                    min="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observacoes</Label>
                <Textarea id="notes" name="notes" rows={2} />
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Registrando..." : "Registrar Pesagem"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {measurements.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhuma pesagem registrada.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Peso (kg)</TableHead>
              <TableHead>Gordura (%)</TableHead>
              <TableHead>Massa Magra (kg)</TableHead>
              <TableHead>Obs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {measurements.map((m) => {
              const weight = toNum(m.weightKg)!;
              const fat = toNum(m.fatPercentage);
              const lean = toNum(m.leanMassKg);
              return (
                <TableRow key={m.id}>
                  <TableCell>{formatDate(m.measurementDate)}</TableCell>
                  <TableCell>{weight.toFixed(1)}</TableCell>
                  <TableCell>
                    {fat !== null ? `${fat.toFixed(1)}%` : "-"}
                  </TableCell>
                  <TableCell>
                    {lean !== null ? lean.toFixed(1) : "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {m.notes || "-"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
