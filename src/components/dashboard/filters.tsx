"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface FiltersProps {
  clinics: { id: string; name: string }[];
}

export function Filters({ clinics }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || ""
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard?${params.toString()}`);
  }

  const debouncedSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateFilter("search", value);
      }, 300);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Sync local state when URL changes externally (e.g. clear filters)
  useEffect(() => {
    setSearchValue(searchParams.get("search") || "");
  }, [searchParams]);

  function handleSearchChange(value: string) {
    setSearchValue(value);
    debouncedSearch(value);
  }

  function clearFilters() {
    setSearchValue("");
    router.push("/dashboard");
  }

  const hasFilters =
    searchParams.has("clinicId") ||
    searchParams.has("status") ||
    searchParams.has("lowStock") ||
    searchParams.has("search") ||
    searchParams.has("dateFrom") ||
    searchParams.has("dateTo") ||
    searchParams.has("sortBy");

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar paciente..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 w-[260px]"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={searchParams.get("clinicId") || "all"}
          onValueChange={(v) => updateFilter("clinicId", v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Unidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as unidades</SelectItem>
            {clinics.map((clinic) => (
              <SelectItem key={clinic.id} value={clinic.id}>
                {clinic.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("status") || "all"}
          onValueChange={(v) => updateFilter("status", v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ACTIVE">Ativo</SelectItem>
            <SelectItem value="COMPLETED">Concluido</SelectItem>
            <SelectItem value="PAUSED">Pausado</SelectItem>
            <SelectItem value="CANCELLED">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("lowStock") || "all"}
          onValueChange={(v) => updateFilter("lowStock", v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estoque" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo estoque</SelectItem>
            <SelectItem value="true">Estoque baixo</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Início do tratamento:</span>
          <Input
            type="date"
            value={searchParams.get("dateFrom") || ""}
            onChange={(e) => updateFilter("dateFrom", e.target.value)}
            className="w-[150px]"
            title="De"
          />
          <Input
            type="date"
            value={searchParams.get("dateTo") || ""}
            onChange={(e) => updateFilter("dateTo", e.target.value)}
            className="w-[150px]"
            title="Até"
          />
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
