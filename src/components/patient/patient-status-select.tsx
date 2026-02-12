"use client";

import { updatePatientStatus } from "@/lib/actions/patients";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PatientStatusSelectProps {
  patientId: string;
  currentStatus: string;
}

export function PatientStatusSelect({
  patientId,
  currentStatus,
}: PatientStatusSelectProps) {
  return (
    <Select
      defaultValue={currentStatus}
      onValueChange={async (value) => {
        await updatePatientStatus(patientId, value);
      }}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ACTIVE">Ativo</SelectItem>
        <SelectItem value="COMPLETED">Concluido</SelectItem>
        <SelectItem value="PAUSED">Pausado</SelectItem>
        <SelectItem value="CANCELLED">Cancelado</SelectItem>
      </SelectContent>
    </Select>
  );
}
