"use client";

import { useState } from "react";
import { useActionState } from "react";
import { createApplication } from "@/lib/actions/applications";
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
  const [state, formAction, pending] = useActionState(
    async (_prev: any, formData: FormData) => {
      const result = await createApplication(formData);
      if (result?.success) setOpen(false);
      return result;
    },
    null
  );

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => {
              return (
                <TableRow key={app.id}>
                  <TableCell>{formatDate(app.applicationDate)}</TableCell>
                  <TableCell>{Number(app.doseMg).toFixed(1)}mg</TableCell>
                  <TableCell>{app.administeredBy}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {app.notes || "-"}
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
