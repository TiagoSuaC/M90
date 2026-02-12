"use client";

import { useState } from "react";
import { useActionState } from "react";
import { createStockAdjustment } from "@/lib/actions/stock";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
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
  const [state, formAction, pending] = useActionState(
    async (_prev: any, formData: FormData) => {
      const result = await createStockAdjustment(formData);
      if (result?.success) setOpen(false);
      return result;
    },
    null
  );

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
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
