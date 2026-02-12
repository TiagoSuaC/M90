"use client";

import { useState, useActionState } from "react";
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
import { Syringe } from "lucide-react";

interface QuickApplyDialogProps {
  patientId: string;
  patientName: string;
  currentDoseMg?: number;
}

export function QuickApplyDialog({
  patientId,
  patientName,
  currentDoseMg,
}: QuickApplyDialogProps) {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" title="Aplicar medicacao">
          <Syringe className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aplicacao Rapida</DialogTitle>
          <DialogDescription>
            Registrar aplicacao para {patientName}
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
            <Label htmlFor={`qa-date-${patientId}`}>Data da aplicacao</Label>
            <Input
              id={`qa-date-${patientId}`}
              name="applicationDate"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`qa-dose-${patientId}`}>Dose (mg)</Label>
            <Input
              id={`qa-dose-${patientId}`}
              name="doseMg"
              type="number"
              step="0.5"
              min="0.5"
              defaultValue={currentDoseMg || 2.5}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`qa-notes-${patientId}`}>Observacoes</Label>
            <Textarea
              id={`qa-notes-${patientId}`}
              name="notes"
              rows={2}
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Registrando..." : "Registrar Aplicacao"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
