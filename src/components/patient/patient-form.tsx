"use client";

import { useActionState } from "react";
import { createPatient, updatePatient } from "@/lib/actions/patients";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PatientFormProps {
  clinics: { id: string; name: string }[];
  packages: { id: string; name: string }[];
  patient?: {
    id: string;
    fullName: string;
    clinicId: string;
    packageTemplateId: string;
    startDate: Date;
    notes: string | null;
  };
}

export function PatientForm({ clinics, packages, patient }: PatientFormProps) {
  const isEditing = !!patient;
  const action = isEditing ? updatePatient : createPatient;

  const [state, formAction, pending] = useActionState(
    async (_prev: any, formData: FormData) => {
      return action(formData);
    },
    null
  );

  const formatDateInput = (date: Date) => {
    return new Date(date).toISOString().split("T")[0];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Paciente" : "Novo Paciente"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          {isEditing && <input type="hidden" name="id" value={patient.id} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={patient?.fullName || ""}
                required
              />
            </div>

            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="contractCode">Codigo do contrato</Label>
                <Input
                  id="contractCode"
                  name="contractCode"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="clinicId">Unidade</Label>
              <Select name="clinicId" defaultValue={patient?.clinicId || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="packageTemplateId">Pacote</Label>
                <Select name="packageTemplateId" defaultValue={packages[0]?.id || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o pacote" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="startDate">Data de inicio</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={
                  patient?.startDate
                    ? formatDateInput(patient.startDate)
                    : new Date().toISOString().split("T")[0]
                }
                required
              />
            </div>
          </div>

          {!isEditing && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium mb-3">Indicacao Inicial</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="initialDoseMg">Dose (mg por aplicacao)</Label>
                  <Input
                    id="initialDoseMg"
                    name="initialDoseMg"
                    type="number"
                    step="0.5"
                    min="0"
                    defaultValue="2.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initialFrequencyDays">
                    Frequencia (dias)
                  </Label>
                  <Select name="initialFrequencyDays" defaultValue="7">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Semanal (7 dias)</SelectItem>
                      <SelectItem value="14">Quinzenal (14 dias)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Observacoes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={patient?.notes || ""}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={pending}>
              {pending
                ? "Salvando..."
                : isEditing
                ? "Salvar Alteracoes"
                : "Cadastrar Paciente"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
