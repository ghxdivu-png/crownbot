import { useState } from "react";
import { useGetTimeouts, getGetTimeoutsQueryKey, exportTimeouts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Search } from "lucide-react";
import { format } from "date-fns";

export default function Timeouts() {
  const [search, setSearch] = useState("");
  const { data: timeouts, isLoading } = useGetTimeouts({ guildId: "demo" }, {
    query: { queryKey: getGetTimeoutsQueryKey({ guildId: "demo" }) }
  });

  const handleExport = async () => {
    try {
      const csvText = await exportTimeouts({ guildId: "demo" });
      const blob = new Blob([csvText], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timeouts-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed", error);
    }
  };

  const filteredTimeouts = timeouts?.filter(t => 
    t.username.toLowerCase().includes(search.toLowerCase()) || 
    t.userId.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold tracking-tight text-foreground uppercase">
            Active Timeouts
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            Monitor and manage currently restricted users.
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" className="font-mono text-xs border-border">
          <Download className="w-4 h-4 mr-2" />
          EXPORT CSV
        </Button>
      </div>

      <Card className="border-border rounded-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-mono text-muted-foreground uppercase">Records</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search user or ID..."
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
                  <TableHead className="font-mono text-xs uppercase w-[150px] text-right">Expires</TableHead>
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
                ) : filteredTimeouts && filteredTimeouts.length > 0 ? (
                  filteredTimeouts.map((timeout) => (
                    <TableRow key={timeout.id} className="border-border hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{timeout.username}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{timeout.userId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{timeout.moderatorTag}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{timeout.moderatorId}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{timeout.reason}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-mono text-xs text-primary">{format(new Date(timeout.expiresAt), "HH:mm:ss")}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{format(new Date(timeout.expiresAt), "MM/dd/yyyy")}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center font-mono text-sm text-muted-foreground">
                      NO ACTIVE TIMEOUTS
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
