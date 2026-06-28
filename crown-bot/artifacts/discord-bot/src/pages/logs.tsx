import { useState } from "react";
import { useGetModerationLogs, getGetModerationLogsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function Logs() {
  const [actionFilter, setActionFilter] = useState<string>("all");
  
  const queryParams = { 
    guildId: "demo", 
    limit: 100,
    ...(actionFilter !== "all" ? { action: actionFilter } : {}) 
  };

  const { data: logs, isLoading } = useGetModerationLogs(queryParams, {
    query: { queryKey: getGetModerationLogsQueryKey(queryParams) }
  });

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "ban": return "bg-destructive/20 text-destructive border-destructive/30";
      case "kick": return "bg-orange-500/20 text-orange-500 border-orange-500/30";
      case "warn": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "timeout": return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold tracking-tight text-foreground uppercase">
            Audit Log
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            Comprehensive history of all moderation actions.
          </p>
        </div>
      </div>

      <Card className="border-border rounded-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-mono text-muted-foreground uppercase">Entries</CardTitle>
            <div className="w-48">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="h-9 text-xs font-mono rounded-sm border-border bg-background">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent className="border-border rounded-sm">
                  <SelectItem value="all" className="font-mono text-xs">ALL ACTIONS</SelectItem>
                  <SelectItem value="ban" className="font-mono text-xs">BAN</SelectItem>
                  <SelectItem value="kick" className="font-mono text-xs">KICK</SelectItem>
                  <SelectItem value="warn" className="font-mono text-xs">WARN</SelectItem>
                  <SelectItem value="timeout" className="font-mono text-xs">TIMEOUT</SelectItem>
                  <SelectItem value="unlock" className="font-mono text-xs">UNLOCK</SelectItem>
                  <SelectItem value="lock" className="font-mono text-xs">LOCK</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-mono text-xs uppercase w-[100px]">Action</TableHead>
                  <TableHead className="font-mono text-xs uppercase w-[200px]">User</TableHead>
                  <TableHead className="font-mono text-xs uppercase w-[200px]">Moderator</TableHead>
                  <TableHead className="font-mono text-xs uppercase">Details</TableHead>
                  <TableHead className="font-mono text-xs uppercase w-[150px] text-right">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i} className="border-border">
                      <TableCell><Skeleton className="h-6 w-16 rounded-sm" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : logs && logs.length > 0 ? (
                  logs.map((log) => (
                    <TableRow key={log.id} className="border-border hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <span className={`font-mono text-[10px] uppercase px-2 py-1 rounded-sm border ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{log.username || "Unknown"}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{log.userId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{log.moderatorTag}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{log.moderatorId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">{log.reason}</span>
                          {log.duration && (
                            <span className="font-mono text-[10px] text-primary">Duration: {log.duration}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-mono text-xs text-foreground">{format(new Date(log.createdAt), "HH:mm:ss")}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{format(new Date(log.createdAt), "MM/dd/yyyy")}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center font-mono text-sm text-muted-foreground">
                      NO LOGS FOUND
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
