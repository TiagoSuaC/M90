"use client";

import { Progress } from "@/components/ui/progress";

interface InlineProgressProps {
  value: number;
  className?: string;
}

export function InlineProgress({ value, className }: InlineProgressProps) {
  return <Progress value={value} className={className} />;
}
