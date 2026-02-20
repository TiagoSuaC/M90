"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import { createMeasurement, updateMeasurement, deleteMeasurement } from "@/lib/actions/measurements";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react";
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
  const [editOpen, setEditOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const [state, formAction, pending] = useActionState(
    async (_prev: any, formData: FormData) => {
      const result = await createMeasurement(formData);
      if (result?.success) setOpen(false);
      return result;
    },
    null
  );

  const [editState, editFormAction, editPending] = useActionState(
    async (_prev: any, formData: FormData) => {
      const result = await updateMeasurement(formData);
      if (result?.success) {
        setEditOpen(false);
        setEditingMeasurement(null);
      }
      return result;
    },
    null
  );

  function handleEdit(m: Measurement) {
    setEditingMeasurement(m);
    setEditOpen(true);
  }

  function handleDelete() {
    if (!deleteId) return;
    startDeleteTransition(async () => {
      await deleteMeasurement(deleteId, patientId);
      setDeleteId(null);
    });
  }

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
              <TableHead className="w-[50px]" />
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
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(m)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeleteId(m.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditingMeasurement(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pesagem</DialogTitle>
            <DialogDescription>Altere os dados da pesagem</DialogDescription>
          </DialogHeader>
          {editingMeasurement && (
            <form action={editFormAction} className="space-y-4">
              <input type="hidden" name="id" value={editingMeasurement.id} />
              <input type="hidden" name="patientId" value={patientId} />
              {editState?.error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {editState.error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit-measurementDate">Data</Label>
                <Input
                  id="edit-measurementDate"
                  name="measurementDate"
                  type="date"
                  defaultValue={editingMeasurement.measurementDate.split("T")[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-weightKg">Peso (kg)</Label>
                <Input
                  id="edit-weightKg"
                  name="weightKg"
                  type="number"
                  step="0.1"
                  min="0.1"
                  defaultValue={Number(editingMeasurement.weightKg)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-fatPercentage">Gordura (%)</Label>
                  <Input
                    id="edit-fatPercentage"
                    name="fatPercentage"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    defaultValue={editingMeasurement.fatPercentage !== null ? Number(editingMeasurement.fatPercentage) : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-leanMassKg">Massa magra (kg)</Label>
                  <Input
                    id="edit-leanMassKg"
                    name="leanMassKg"
                    type="number"
                    step="0.1"
                    min="0"
                    defaultValue={editingMeasurement.leanMassKg !== null ? Number(editingMeasurement.leanMassKg) : ""}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Observacoes</Label>
                <Textarea
                  id="edit-notes"
                  name="notes"
                  rows={2}
                  defaultValue={editingMeasurement.notes || ""}
                />
              </div>
              <Button type="submit" className="w-full" disabled={editPending}>
                {editPending ? "Salvando..." : "Salvar Alteracoes"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pesagem</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta pesagem? Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
