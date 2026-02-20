"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import { createUser, updateUser, deleteUser } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  clinicId: string | null;
  clinicName: string | null;
}

interface Clinic {
  id: string;
  name: string;
}

interface UsersManagerProps {
  users: UserItem[];
  clinics: Clinic[];
  currentUserId: string;
}

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  NURSING: "Enfermagem",
  ENDOCRINO: "Endocrinologista",
  NUTRI: "Nutricionista",
};

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  NURSING: "secondary",
  ENDOCRINO: "outline",
  NUTRI: "outline",
};

export function UsersManager({ users, clinics, currentUserId }: UsersManagerProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  // Controlled select state for create form
  const [createRole, setCreateRole] = useState("NURSING");
  const [createClinicId, setCreateClinicId] = useState("");

  // Controlled select state for edit form
  const [editRole, setEditRole] = useState("");
  const [editClinicId, setEditClinicId] = useState("");

  const [state, formAction, pending] = useActionState(
    async (_prev: any, formData: FormData) => {
      formData.set("role", createRole);
      if (createClinicId && createClinicId !== "__none__") {
        formData.set("clinicId", createClinicId);
      } else {
        formData.delete("clinicId");
      }
      const result = await createUser(formData);
      if (result?.success) {
        setOpen(false);
        setCreateRole("NURSING");
        setCreateClinicId("");
      }
      return result;
    },
    null
  );

  const [editState, editFormAction, editPending] = useActionState(
    async (_prev: any, formData: FormData) => {
      formData.set("role", editRole);
      if (editClinicId && editClinicId !== "__none__") {
        formData.set("clinicId", editClinicId);
      } else {
        formData.delete("clinicId");
      }
      // Don't send empty password
      const pw = formData.get("password") as string;
      if (!pw) formData.delete("password");
      const result = await updateUser(formData);
      if (result?.success) {
        setEditOpen(false);
        setEditingUser(null);
      }
      return result;
    },
    null
  );

  function handleEdit(user: UserItem) {
    setEditingUser(user);
    setEditRole(user.role);
    setEditClinicId(user.clinicId || "__none__");
    setEditOpen(true);
  }

  function handleDelete() {
    if (!deleteId) return;
    startDeleteTransition(async () => {
      await deleteUser(deleteId);
      setDeleteId(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Usuarios</h3>
        <Dialog open={open} onOpenChange={(o) => {
          setOpen(o);
          if (!o) {
            setCreateRole("NURSING");
            setCreateClinicId("");
          }
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Novo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Usuario</DialogTitle>
              <DialogDescription>Preencha os dados do novo usuario</DialogDescription>
            </DialogHeader>
            <form action={formAction} className="space-y-4">
              {state?.error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {state.error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" name="password" type="password" minLength={6} required />
              </div>
              <div className="space-y-2">
                <Label>Perfil</Label>
                <Select value={createRole} onValueChange={setCreateRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="NURSING">Enfermagem</SelectItem>
                    <SelectItem value="ENDOCRINO">Endocrinologista</SelectItem>
                    <SelectItem value="NUTRI">Nutricionista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Select value={createClinicId} onValueChange={setCreateClinicId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Nenhuma</SelectItem>
                    {clinics.map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Criando..." : "Criar Usuario"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {users.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum usuario cadastrado.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={roleBadgeVariant[user.role] || "outline"}>
                    {roleLabels[user.role] || user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.clinicName || "-"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(user)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      {user.id !== currentUserId && (
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeleteId(user.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditingUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Altere os dados do usuario</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form action={editFormAction} className="space-y-4">
              <input type="hidden" name="id" value={editingUser.id} />
              {editState?.error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {editState.error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingUser.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  defaultValue={editingUser.email}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Senha</Label>
                <Input
                  id="edit-password"
                  name="password"
                  type="password"
                  placeholder="Deixe em branco para manter"
                />
              </div>
              <div className="space-y-2">
                <Label>Perfil</Label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="NURSING">Enfermagem</SelectItem>
                    <SelectItem value="ENDOCRINO">Endocrinologista</SelectItem>
                    <SelectItem value="NUTRI">Nutricionista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Select value={editClinicId} onValueChange={setEditClinicId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Nenhuma</SelectItem>
                    {clinics.map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <AlertDialogTitle>Excluir usuario</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este usuario? Esta acao nao pode ser desfeita.
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
