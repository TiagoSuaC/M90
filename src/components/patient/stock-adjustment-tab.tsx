"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import { createStockAdjustment, updateStockAdjustment, deleteStockAdjustment } from "@/lib/actions/stock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface StockAdjustment {
  id: string;
  adjustmentMg: number;
  reason: string;
  createdById: string;
  createdAt: string;
}

interface StockAdjustmentTabProps {
  patientId: string;
  adjustments: StockAdjustment[];
  isAdmin: boolean;
}

export function StockAdjustmentTab({
  patientId,
  adjustments,
  isAdmin,
}: StockAdjustmentTabProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingAdj, setEditingAdj] = useState<StockAdjustment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const [state, formAction, pending] = useActionState(
    async (_prev: any, formData: FormData) => {
      const result = await createStockAdjustment(formData);
      if (result?.success) setOpen(false);
      return result;
    },
    null
  );

  const [editState, editFormAction, editPending] = useActionState(
    async (_prev: any, formData: FormData) => {
      const result = await updateStockAdjustment(formData);
      if (result?.success) {
        setEditOpen(false);
        setEditingAdj(null);
      }
      return result;
    },
    null
  );

  function handleEdit(adj: StockAdjustment) {
    setEditingAdj(adj);
    setEditOpen(true);
  }

  function handleDelete() {
    if (!deleteId) return;
    startDeleteTransition(async () => {
      await deleteStockAdjustment(deleteId, patientId);
      setDeleteId(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Ajustes de Estoque</h3>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Ajustar Estoque
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajuste de Estoque</DialogTitle>
                <DialogDescription>
                  Positivo = adicionar, Negativo = remover
                </DialogDescription>
              </DialogHeader>
              <form action={formAction} className="space-y-4">
                <input type="hidden" name="patientId" value={patientId} />
                {state?.error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                    {state.error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="adjustmentMg">Ajuste (mg)</Label>
                  <Input
                    id="adjustmentMg"
                    name="adjustmentMg"
                    type="number"
                    step="0.5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo</Label>
                  <Input id="reason" name="reason" required />
                </div>
                <Button type="submit" className="w-full" disabled={pending}>
                  {pending ? "Salvando..." : "Registrar Ajuste"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {adjustments.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhum ajuste de estoque.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Ajuste</TableHead>
              <TableHead>Motivo</TableHead>
              {isAdmin && <TableHead className="w-[50px]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {adjustments.map((a) => {
              const mg = Number(a.adjustmentMg);
              return (
                <TableRow key={a.id}>
                  <TableCell>{formatDate(a.createdAt)}</TableCell>
                  <TableCell
                    className={mg > 0 ? "text-green-600" : "text-red-600"}
                  >
                    {mg > 0 ? "+" : ""}
                    {mg.toFixed(1)}mg
                  </TableCell>
                  <TableCell>{a.reason}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(a)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteId(a.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditingAdj(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ajuste de Estoque</DialogTitle>
            <DialogDescription>Altere os dados do ajuste</DialogDescription>
          </DialogHeader>
          {editingAdj && (
            <form action={editFormAction} className="space-y-4">
              <input type="hidden" name="id" value={editingAdj.id} />
              <input type="hidden" name="patientId" value={patientId} />
              {editState?.error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {editState.error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit-adjustmentMg">Ajuste (mg)</Label>
                <Input
                  id="edit-adjustmentMg"
                  name="adjustmentMg"
                  type="number"
                  step="0.5"
                  defaultValue={Number(editingAdj.adjustmentMg)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-reason">Motivo</Label>
                <Input
                  id="edit-reason"
                  name="reason"
                  defaultValue={editingAdj.reason}
                  required
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
            <AlertDialogTitle>Excluir ajuste de estoque</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este ajuste? Esta acao nao pode ser desfeita.
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
