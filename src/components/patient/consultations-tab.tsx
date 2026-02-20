"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import { createConsultation, updateConsultation, deleteConsultation } from "@/lib/actions/consultations";
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

import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Consultation {
  id: string;
  type: string;
  consultationDate: string;
  professional: string;
  notes: string | null;
  dietNotes: string | null;
  trainingNotes: string | null;
  sleepNotes: string | null;
  hydrationNotes: string | null;
  otherNotes: string | null;
  countsInPackage: boolean;
  createdAt: string;
}

interface ConsultationsTabProps {
  patientId: string;
  consultations: Consultation[];
}

function hasEndocrinoDetails(c: Consultation) {
  return c.dietNotes || c.trainingNotes || c.sleepNotes || c.hydrationNotes || c.otherNotes;
}

function EndocrinoDetailsDialog({ consultation }: { consultation: Consultation }) {
  const details = [
    { label: "Dieta", value: consultation.dietNotes },
    { label: "Treino", value: consultation.trainingNotes },
    { label: "Sono", value: consultation.sleepNotes },
    { label: "Hidratacao", value: consultation.hydrationNotes },
    { label: "Outras Obs.", value: consultation.otherNotes },
  ].filter((d) => d.value);

  if (details.length === 0) return <span className="text-muted-foreground">-</span>;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">
          <FileText className="h-4 w-4" />
          {details.length} campo{details.length > 1 ? "s" : ""}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes da Consulta</DialogTitle>
          <DialogDescription>
            {formatDate(consultation.consultationDate)} — {consultation.professional}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {details.map((d) => (
            <div key={d.label}>
              <p className="text-sm font-semibold text-muted-foreground">{d.label}</p>
              <p className="whitespace-pre-wrap">{d.value}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConsultationForm({
  formAction,
  pending,
  error,
  patientId,
  selectedType,
  onTypeChange,
  defaults,
  submitLabel,
  pendingLabel,
}: {
  formAction: (payload: FormData) => void;
  pending: boolean;
  error?: string | null;
  patientId: string;
  selectedType: string;
  onTypeChange: (v: string) => void;
  defaults?: Consultation | null;
  submitLabel: string;
  pendingLabel: string;
}) {
  return (
    <form action={formAction} className="space-y-4">
      {defaults && <input type="hidden" name="id" value={defaults.id} />}
      <input type="hidden" name="patientId" value={patientId} />
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor={defaults ? "edit-type" : "type"}>Tipo</Label>
        <Select
          name="type"
          defaultValue={defaults?.type || "ENDOCRINO"}
          onValueChange={onTypeChange}
        >
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
        <Label htmlFor={defaults ? "edit-consultationDate" : "consultationDate"}>Data da consulta</Label>
        <Input
          id={defaults ? "edit-consultationDate" : "consultationDate"}
          name="consultationDate"
          type="date"
          defaultValue={
            defaults
              ? defaults.consultationDate.split("T")[0]
              : new Date().toISOString().split("T")[0]
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={defaults ? "edit-professional" : "professional"}>Profissional</Label>
        <Input
          id={defaults ? "edit-professional" : "professional"}
          name="professional"
          defaultValue={defaults?.professional || ""}
          required
        />
      </div>

      {selectedType === "ENDOCRINO" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor={defaults ? "edit-dietNotes" : "dietNotes"}>Dieta</Label>
            <p className="text-sm text-muted-foreground">
              Voce sente que sua dificuldade e por falta de planejamento ou por uma fome/vontade incontrolavel?
            </p>
            <Textarea
              id={defaults ? "edit-dietNotes" : "dietNotes"}
              name="dietNotes"
              rows={2}
              defaultValue={defaults?.dietNotes || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={defaults ? "edit-trainingNotes" : "trainingNotes"}>Treino</Label>
            <p className="text-sm text-muted-foreground">
              Como esta sua disposicao para treinar e quanto tempo voce leva para se recuperar apos o exercicio?
            </p>
            <Textarea
              id={defaults ? "edit-trainingNotes" : "trainingNotes"}
              name="trainingNotes"
              rows={2}
              defaultValue={defaults?.trainingNotes || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={defaults ? "edit-sleepNotes" : "sleepNotes"}>Sono</Label>
            <p className="text-sm text-muted-foreground">
              Voce acorda sentindo que descansou ou desperta cansada, quantas horas de sono em media por noite?
            </p>
            <Textarea
              id={defaults ? "edit-sleepNotes" : "sleepNotes"}
              name="sleepNotes"
              rows={2}
              defaultValue={defaults?.sleepNotes || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={defaults ? "edit-hydrationNotes" : "hydrationNotes"}>Hidratacao</Label>
            <p className="text-sm text-muted-foreground">
              Qual a sua media diaria de ingestao de agua e voce percebe oscilacoes frequentes de inchaco?
            </p>
            <Textarea
              id={defaults ? "edit-hydrationNotes" : "hydrationNotes"}
              name="hydrationNotes"
              rows={2}
              defaultValue={defaults?.hydrationNotes || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={defaults ? "edit-otherNotes" : "otherNotes"}>Outras Observacoes</Label>
            <Textarea
              id={defaults ? "edit-otherNotes" : "otherNotes"}
              name="otherNotes"
              rows={2}
              placeholder="Observacoes adicionais..."
              defaultValue={defaults?.otherNotes || ""}
            />
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <Label htmlFor={defaults ? "edit-notes" : "notes"}>Observacoes</Label>
          <Textarea
            id={defaults ? "edit-notes" : "notes"}
            name="notes"
            rows={2}
            defaultValue={defaults?.notes || ""}
          />
        </div>
      )}

      <input type="hidden" name="countsInPackage" value="true" />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}

export function ConsultationsTab({
  patientId,
  consultations,
}: ConsultationsTabProps) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("ENDOCRINO");

  const [editOpen, setEditOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  const [editSelectedType, setEditSelectedType] = useState<string>("ENDOCRINO");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const [state, formAction, pending] = useActionState(
    async (_prev: any, formData: FormData) => {
      const result = await createConsultation(formData);
      if (result?.success) setOpen(false);
      return result;
    },
    null
  );

  const [editState, editFormAction, editPending] = useActionState(
    async (_prev: any, formData: FormData) => {
      const result = await updateConsultation(formData);
      if (result?.success) {
        setEditOpen(false);
        setEditingConsultation(null);
      }
      return result;
    },
    null
  );

  function handleEdit(c: Consultation) {
    setEditingConsultation(c);
    setEditSelectedType(c.type);
    setEditOpen(true);
  }

  function handleDelete() {
    if (!deleteId) return;
    startDeleteTransition(async () => {
      await deleteConsultation(deleteId, patientId);
      setDeleteId(null);
    });
  }

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
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Consulta</DialogTitle>
              <DialogDescription>Preencha os dados da consulta realizada</DialogDescription>
            </DialogHeader>
            <ConsultationForm
              formAction={formAction}
              pending={pending}
              error={state?.error}
              patientId={patientId}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              submitLabel="Registrar Consulta"
              pendingLabel="Registrando..."
            />
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
              <TableHead>Detalhes</TableHead>
              <TableHead className="w-[50px]" />
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
                <TableCell>
                  {c.type === "ENDOCRINO" && hasEndocrinoDetails(c) ? (
                    <EndocrinoDetailsDialog consultation={c} />
                  ) : (
                    <span className="text-muted-foreground">
                      {c.notes || "-"}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(c)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteId(c.id)}
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
      <Dialog
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o);
          if (!o) setEditingConsultation(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Consulta</DialogTitle>
            <DialogDescription>Altere os dados da consulta</DialogDescription>
          </DialogHeader>
          {editingConsultation && (
            <ConsultationForm
              formAction={editFormAction}
              pending={editPending}
              error={editState?.error}
              patientId={patientId}
              selectedType={editSelectedType}
              onTypeChange={setEditSelectedType}
              defaults={editingConsultation}
              submitLabel="Salvar Alteracoes"
              pendingLabel="Salvando..."
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir consulta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta consulta? Esta acao nao pode ser desfeita.
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
