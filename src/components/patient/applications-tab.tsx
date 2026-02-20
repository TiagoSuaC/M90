"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import { createApplication, updateApplication, deleteApplication } from "@/lib/actions/applications";
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

interface Application {
  id: string;
  applicationDate: string;
  doseMg: number;
  notes: string | null;
  administeredBy: string;
  createdAt: string;
}

interface ApplicationsTabProps {
  patientId: string;
  applications: Application[];
  currentDoseMg?: number;
}

export function ApplicationsTab({
  patientId,
  applications,
  currentDoseMg,
}: ApplicationsTabProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const [state, formAction, pending] = useActionState(
    async (_prev: any, formData: FormData) => {
      const result = await createApplication(formData);
      if (result?.success) setOpen(false);
      return result;
    },
    null
  );

  const [editState, editFormAction, editPending] = useActionState(
    async (_prev: any, formData: FormData) => {
      const result = await updateApplication(formData);
      if (result?.success) {
        setEditOpen(false);
        setEditingApp(null);
      }
      return result;
    },
    null
  );

  function handleEdit(app: Application) {
    setEditingApp(app);
    setEditOpen(true);
  }

  function handleDelete() {
    if (!deleteId) return;
    startDeleteTransition(async () => {
      await deleteApplication(deleteId, patientId);
      setDeleteId(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Aplicacoes</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Nova Aplicacao
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Aplicacao</DialogTitle>
              <DialogDescription>Preencha os dados da aplicacao de Tirzepatida</DialogDescription>
            </DialogHeader>
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="patientId" value={patientId} />
              {state?.error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {state.error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="applicationDate">Data da aplicacao</Label>
                <Input
                  id="applicationDate"
                  name="applicationDate"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doseMg">Dose (mg)</Label>
                <Input
                  id="doseMg"
                  name="doseMg"
                  type="number"
                  step="0.5"
                  min="0.5"
                  defaultValue={currentDoseMg || 2.5}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observacoes</Label>
                <Textarea id="notes" name="notes" rows={2} />
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Registrando..." : "Registrar Aplicacao"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {applications.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhuma aplicacao registrada.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Dose</TableHead>
              <TableHead>Aplicado por</TableHead>
              <TableHead>Obs</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell>{formatDate(app.applicationDate)}</TableCell>
                <TableCell>{Number(app.doseMg).toFixed(1)}mg</TableCell>
                <TableCell>{app.administeredBy}</TableCell>
                <TableCell className="text-muted-foreground">
                  {app.notes || "-"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(app)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteId(app.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditingApp(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Aplicacao</DialogTitle>
            <DialogDescription>Altere os dados da aplicacao</DialogDescription>
          </DialogHeader>
          {editingApp && (
            <form action={editFormAction} className="space-y-4">
              <input type="hidden" name="id" value={editingApp.id} />
              <input type="hidden" name="patientId" value={patientId} />
              {editState?.error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {editState.error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit-applicationDate">Data da aplicacao</Label>
                <Input
                  id="edit-applicationDate"
                  name="applicationDate"
                  type="date"
                  defaultValue={editingApp.applicationDate.split("T")[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-doseMg">Dose (mg)</Label>
                <Input
                  id="edit-doseMg"
                  name="doseMg"
                  type="number"
                  step="0.5"
                  min="0.5"
                  defaultValue={Number(editingApp.doseMg)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Observacoes</Label>
                <Textarea
                  id="edit-notes"
                  name="notes"
                  rows={2}
                  defaultValue={editingApp.notes || ""}
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
            <AlertDialogTitle>Excluir aplicacao</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta aplicacao? Esta acao nao pode ser desfeita.
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
