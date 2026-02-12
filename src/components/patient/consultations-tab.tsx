"use client";

import { useState } from "react";
import { useActionState } from "react";
import { createConsultation } from "@/lib/actions/consultations";
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

interface Consultation {
  id: string;
  type: string;
  consultationDate: string;
  professional: string;
  notes: string | null;
  countsInPackage: boolean;
  createdAt: string;
}

interface ConsultationsTabProps {
  patientId: string;
  consultations: Consultation[];
}

export function ConsultationsTab({
  patientId,
  consultations,
}: ConsultationsTabProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_prev: any, formData: FormData) => {
      const result = await createConsultation(formData);
      if (result?.success) setOpen(false);
      return result;
    },
    null
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Consultas</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Nova Consulta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Consulta</DialogTitle>
              <DialogDescription>Preencha os dados da consulta realizada</DialogDescription>
            </DialogHeader>
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="patientId" value={patientId} />
              {state?.error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {state.error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select name="type" defaultValue="ENDOCRINO">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENDOCRINO">Endocrinologista</SelectItem>
                    <SelectItem value="NUTRI">Nutricionista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="consultationDate">Data da consulta</Label>
                <Input
                  id="consultationDate"
                  name="consultationDate"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="professional">Profissional</Label>
                <Input
                  id="professional"
                  name="professional"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observacoes</Label>
                <Textarea id="notes" name="notes" rows={2} />
              </div>
              <input type="hidden" name="countsInPackage" value="true" />
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Registrando..." : "Registrar Consulta"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {consultations.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhuma consulta registrada.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Profissional</TableHead>
              <TableHead>Pacote</TableHead>
              <TableHead>Obs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consultations.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{formatDate(c.consultationDate)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      c.type === "ENDOCRINO" ? "default" : "secondary"
                    }
                  >
                    {c.type === "ENDOCRINO" ? "Endocrino" : "Nutri"}
                  </Badge>
                </TableCell>
                <TableCell>{c.professional}</TableCell>
                <TableCell>
                  {c.countsInPackage ? "Sim" : "Nao"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {c.notes || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
