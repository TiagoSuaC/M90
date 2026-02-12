"use client";

import { useState } from "react";
import { useActionState } from "react";
import { createIndication } from "@/lib/actions/indications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Indication {
  id: string;
  startDate: string;
  doseMgPerApplication: number;
  frequencyDays: number;
  notes: string | null;
  createdAt: string;
}

interface IndicationsTabProps {
  patientId: string;
  indications: Indication[];
}

export function IndicationsTab({ patientId, indications }: IndicationsTabProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_prev: any, formData: FormData) => {
      const result = await createIndication(formData);
      if (result?.success) setOpen(false);
      return result;
    },
    null
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Indicacoes Medicas</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Nova Indicacao
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Indicacao Medica</DialogTitle>
              <DialogDescription>Registre a nova prescricao de dose</DialogDescription>
            </DialogHeader>
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="patientId" value={patientId} />
              {state?.error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {state.error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="startDate">Data de inicio</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doseMgPerApplication">
                  Dose por aplicacao (mg)
                </Label>
                <Input
                  id="doseMgPerApplication"
                  name="doseMgPerApplication"
                  type="number"
                  step="0.5"
                  min="0.5"
                  defaultValue="5"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequencyDays">Frequencia</Label>
                <Select name="frequencyDays" defaultValue="7">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Semanal (7 dias)</SelectItem>
                    <SelectItem value="14">Quinzenal (14 dias)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observacoes</Label>
                <Textarea id="notes" name="notes" rows={2} />
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Salvando..." : "Registrar Indicacao"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {indications.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhuma indicacao registrada.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Inicio</TableHead>
              <TableHead>Dose</TableHead>
              <TableHead>Frequencia</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Obs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {indications.map((ind, i) => {
              const dose = Number(ind.doseMgPerApplication);
              const isCurrent = i === 0;
              return (
                <TableRow key={ind.id}>
                  <TableCell>{formatDate(ind.startDate)}</TableCell>
                  <TableCell>{dose.toFixed(1)}mg</TableCell>
                  <TableCell>
                    {ind.frequencyDays === 7
                      ? "Semanal"
                      : ind.frequencyDays === 14
                      ? "Quinzenal"
                      : `${ind.frequencyDays} dias`}
                  </TableCell>
                  <TableCell>
                    {isCurrent ? (
                      <Badge variant="success">Atual</Badge>
                    ) : (
                      <Badge variant="secondary">Anterior</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {ind.notes || "-"}
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
