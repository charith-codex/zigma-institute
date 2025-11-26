"use client";

import { type LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UserManagementCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  addLabel: string;
  searchPlaceholder?: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
}

export function UserManagementCard({
  title,
  description,
  icon: Icon,
  addLabel,
  searchPlaceholder = "Search users...",
  searchTerm,
  onSearchChange,
  onAddClick,
  isLoading,
  children,
}: UserManagementCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {description}
            </CardDescription>
          </div>
        </div>
        <Button onClick={onAddClick} disabled={isLoading} size="sm">
          {addLabel}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full sm:max-w-xs"
          />
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
