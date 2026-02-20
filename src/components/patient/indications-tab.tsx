"use client";

import { useState, useTransition } from "react";
import { saveIndicationPlan } from "@/lib/actions/indications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Trash2, Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils";

function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
}

interface Indication {
  id: string;
  phaseOrder: number;
  startDate: string;
  durationWeeks: number | null;
  doseMgPerApplication: number;
  frequencyDays: number;
  notes: string | null;
  createdAt: string;
}

interface IndicationsTabProps {
  patientId: string;
  indications: Indication[];
}

interface PhaseRow {
  id?: string;
  durationWeeks: number;
  doseMg: number;
  frequencyDays: number;
  notes: string;
}

function getPhaseStatus(
  startDate: Date,
  durationWeeks: number | null,
  now: Date
): { label: string; variant: "success" | "default" | "secondary" } {
  if (durationWeeks === null) {
    return startDate <= now
      ? { label: "Em andamento", variant: "success" }
      : { label: "Futura", variant: "secondary" };
  }
  const endDate = addWeeks(startDate, durationWeeks);
  if (endDate <= now) return { label: "Concluida", variant: "default" };
  if (startDate <= now) return { label: "Em andamento", variant: "success" };
  return { label: "Futura", variant: "secondary" };
}

function formatFrequency(days: number): string {
  if (days === 7) return "Semanal";
  if (days === 14) return "Quinzenal";
  return `${days} dias`;
}

function computePhaseDates(planStart: Date, phases: PhaseRow[]) {
  let cumulativeWeeks = 0;
  return phases.map((phase) => {
    const start = addWeeks(planStart, cumulativeWeeks);
    cumulativeWeeks += phase.durationWeeks;
    const end = addWeeks(planStart, cumulativeWeeks);
    return { start, end };
  });
}

export function IndicationsTab({
  patientId,
  indications,
}: IndicationsTabProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const sorted = [...indications].sort(
    (a, b) => a.phaseOrder - b.phaseOrder
  );

  // Determine the plan start date from the first phase
  const planStartDate =
    sorted.length > 0 ? sorted[0].startDate.split("T")[0] : "";

  // Edit form state
  const [startDate, setStartDate] = useState(
    planStartDate || new Date().toISOString().split("T")[0]
  );
  const [phases, setPhases] = useState<PhaseRow[]>([]);

  const totalWeeks = phases.reduce((sum, p) => sum + p.durationWeeks, 0);
  const totalApplicationsEdit = phases.reduce(
    (sum, p) => sum + Math.floor((p.durationWeeks * 7) / p.frequencyDays),
    0
  );
  const totalMgEdit = phases.reduce((sum, p) => {
    const apps = Math.floor((p.durationWeeks * 7) / p.frequencyDays);
    return sum + apps * p.doseMg;
  }, 0);

  function openEditDialog() {
    setError(null);
    if (sorted.length > 0) {
      // Pre-populate from existing indications
      setStartDate(sorted[0].startDate.split("T")[0]);
      setPhases(
        sorted.map((ind) => ({
          id: ind.id,
          durationWeeks: ind.durationWeeks ?? 4,
          doseMg: Number(ind.doseMgPerApplication),
          frequencyDays: ind.frequencyDays,
          notes: ind.notes || "",
        }))
      );
    } else {
      // New protocol defaults
      setStartDate(new Date().toISOString().split("T")[0]);
      setPhases([{ durationWeeks: 4, doseMg: 2.5, frequencyDays: 7, notes: "" }]);
    }
    setOpen(true);
  }

  function addPhase() {
    const lastDose = phases.length > 0 ? phases[phases.length - 1].doseMg : 0;
    setPhases([
      ...phases,
      {
        durationWeeks: 4,
        doseMg: lastDose + 2.5,
        frequencyDays: 7,
        notes: "",
      },
    ]);
  }

  function removePhase(index: number) {
    if (phases.length <= 1) return;
    setPhases(phases.filter((_, i) => i !== index));
  }

  function updatePhase(index: number, field: keyof PhaseRow, value: any) {
    setPhases(
      phases.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveIndicationPlan({
        patientId,
        startDate,
        phases: phases.map((p) => ({
          id: p.id,
          durationWeeks: p.durationWeeks,
          doseMg: p.doseMg,
          frequencyDays: p.frequencyDays,
          notes: p.notes || undefined,
        })),
      });
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
      }
    });
  }

  const now = new Date();

  // Display totals for the read-only table
  const displayTotalWeeks = sorted.reduce(
    (sum, ind) => sum + (ind.durationWeeks ?? 0),
    0
  );
  const displayTotalApplications = sorted.reduce(
    (sum, ind) =>
      sum +
      (ind.durationWeeks !== null
        ? Math.floor((ind.durationWeeks * 7) / ind.frequencyDays)
        : 0),
    0
  );
  const displayTotalMg = sorted.reduce((sum, ind) => {
    if (ind.durationWeeks === null) return sum;
    const apps = Math.floor((ind.durationWeeks * 7) / ind.frequencyDays);
    return sum + apps * Number(ind.doseMgPerApplication);
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Protocolo de Indicacao</h3>
        <Button size="sm" onClick={openEditDialog}>
          {sorted.length > 0 ? (
            <>
              <Pencil className="h-4 w-4 mr-1" />
              Editar Protocolo
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Criar Protocolo
            </>
          )}
        </Button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhum protocolo definido. Clique em &quot;Criar Protocolo&quot; para
          configurar as fases de indicacao medica.
        </p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Fase</TableHead>
                <TableHead>Semanas</TableHead>
                <TableHead>Dose</TableHead>
                <TableHead>Frequencia</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Obs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((ind, i) => {
                const start = new Date(ind.startDate);
                const end =
                  ind.durationWeeks !== null
                    ? addWeeks(start, ind.durationWeeks)
                    : null;
                const status = getPhaseStatus(start, ind.durationWeeks, now);
                return (
                  <TableRow key={ind.id}>
                    <TableCell className="font-medium">{i + 1}</TableCell>
                    <TableCell>
                      {ind.durationWeeks !== null
                        ? `${ind.durationWeeks} sem`
                        : "Indef."}
                    </TableCell>
                    <TableCell>
                      {Number(ind.doseMgPerApplication).toFixed(1)}mg
                    </TableCell>
                    <TableCell>{formatFrequency(ind.frequencyDays)}</TableCell>
                    <TableCell className="text-sm">
                      {formatDate(start)}
                      {end ? ` - ${formatDate(end)}` : ""}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {ind.notes || "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {displayTotalWeeks > 0 && (
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>Duracao total: {displayTotalWeeks} semanas</span>
              <span>Total de aplicacoes: {displayTotalApplications} aplicacoes</span>
              <span>Total de mg: {displayTotalMg.toFixed(1)}mg</span>
            </div>
          )}
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Protocolo de Indicacao</DialogTitle>
            <DialogDescription>
              Configure as fases do protocolo de indicacao medica
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="planStartDate">Data de Inicio do Protocolo</Label>
              <Input
                id="planStartDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Fases</Label>
              {phases.map((phase, index) => {
                const phaseDates = computePhaseDates(
                  new Date(startDate + "T00:00:00"),
                  phases
                );
                const dateRange = phaseDates[index];
                return (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 rounded-lg border bg-muted/30"
                  >
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary text-sm font-medium shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
                      <div>
                        <label className="text-xs text-muted-foreground">
                          Semanas
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={phase.durationWeeks}
                          onChange={(e) =>
                            updatePhase(
                              index,
                              "durationWeeks",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          Dose (mg)
                        </label>
                        <Input
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={phase.doseMg}
                          onChange={(e) =>
                            updatePhase(
                              index,
                              "doseMg",
                              parseFloat(e.target.value) || 0.5
                            )
                          }
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          Frequencia
                        </label>
                        <Select
                          value={String(phase.frequencyDays)}
                          onValueChange={(v) =>
                            updatePhase(index, "frequencyDays", parseInt(v))
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">Semanal</SelectItem>
                            <SelectItem value="14">Quinzenal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          Obs
                        </label>
                        <Input
                          value={phase.notes}
                          onChange={(e) =>
                            updatePhase(index, "notes", e.target.value)
                          }
                          placeholder="Observacoes..."
                          className="h-8"
                        />
                      </div>
                    </div>
                    {dateRange && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap mt-5 hidden sm:block">
                        {formatDate(dateRange.start)} -{" "}
                        {formatDate(dateRange.end)}
                      </span>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0 mt-4 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removePhase(index)}
                      disabled={phases.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPhase}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Fase
            </Button>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>Duracao total: {totalWeeks} semanas</span>
              <span>Total de aplicacoes: {totalApplicationsEdit} aplicacoes</span>
              <span>Total de mg: {totalMgEdit.toFixed(1)}mg</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? "Salvando..." : "Salvar Protocolo"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
