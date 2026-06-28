import { useState } from "react";
import { useGetWarnings, getGetWarningsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { format } from "date-fns";

export default function Warnings() {
  const [search, setSearch] = useState("");
  // Pass userId to filter by if provided
  const queryParams = { guildId: "demo", ...(search ? { userId: search } : {}) };
  
  const { data: warnings, isLoading } = useGetWarnings(queryParams, {
    query: { queryKey: getGetWarningsQueryKey(queryParams) }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold tracking-tight text-foreground uppercase">
            Warning Log
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            Historical record of user infractions.
          </p>
        </div>
      </div>

      <Card className="border-border rounded-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-mono text-muted-foreground uppercase">Records</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by exact User ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-xs font-mono rounded-sm border-border bg-background"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-mono text-xs uppercase w-[250px]">User</TableHead>
                  <TableHead className="font-mono text-xs uppercase w-[200px]">Moderator</TableHead>
                  <TableHead className="font-mono text-xs uppercase">Reason</TableHead>
                  <TableHead className="font-mono text-xs uppercase w-[150px] text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-border">
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : warnings && warnings.length > 0 ? (
                  warnings.map((warning) => (
                    <TableRow key={warning.id} className="border-border hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{warning.username}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{warning.userId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{warning.moderatorTag}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{warning.moderatorId}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{warning.reason}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-mono text-xs text-foreground">{format(new Date(warning.createdAt), "HH:mm:ss")}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{format(new Date(warning.createdAt), "MM/dd/yyyy")}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center font-mono text-sm text-muted-foreground">
                      NO WARNINGS FOUND
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
