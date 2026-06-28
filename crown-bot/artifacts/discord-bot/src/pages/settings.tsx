import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetConfig, getGetConfigQueryKey, useUpdateConfig } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  logChannelId: z.string().nullable().optional(),
  modRoleId: z.string().nullable().optional(),
  muteRoleId: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const guildId = "demo";

  const { data: config, isLoading } = useGetConfig({ guildId }, {
    query: { queryKey: getGetConfigQueryKey({ guildId }) }
  });

  const updateConfig = useUpdateConfig();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      logChannelId: "",
      modRoleId: "",
      muteRoleId: "",
    },
  });

  useEffect(() => {
    if (config) {
      form.reset({
        logChannelId: config.logChannelId || "",
        modRoleId: config.modRoleId || "",
        muteRoleId: config.muteRoleId || "",
      });
    }
  }, [config, form]);

  const onSubmit = (values: FormValues) => {
    updateConfig.mutate({
      data: {
        guildId,
        logChannelId: values.logChannelId || null,
        modRoleId: values.modRoleId || null,
        muteRoleId: values.muteRoleId || null,
      }
    }, {
      onSuccess: (updatedData) => {
        toast({
          title: "Configuration Saved",
          description: "Guild configuration has been updated successfully.",
        });
        queryClient.setQueryData(getGetConfigQueryKey({ guildId }), updatedData);
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update configuration.",
        });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold tracking-tight text-foreground uppercase">
            Guild Configuration
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            System parameters and role mappings.
          </p>
        </div>
      </div>

      <Card className="border-border rounded-sm">
        <CardHeader>
          <CardTitle className="text-sm font-mono text-muted-foreground uppercase">Integration IDs</CardTitle>
          <CardDescription className="font-mono text-xs">Leave blank if not configured.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="logChannelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs uppercase">Audit Log Channel ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 123456789012345678" className="font-mono text-sm rounded-sm border-border bg-background" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Channel where the bot will send moderation event messages.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="modRoleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs uppercase">Moderator Role ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 123456789012345678" className="font-mono text-sm rounded-sm border-border bg-background" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Role required to use moderation commands.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="muteRoleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs uppercase">Muted Role ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 123456789012345678" className="font-mono text-sm rounded-sm border-border bg-background" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Role applied when a user is muted (legacy).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={updateConfig.isPending}
                  className="font-mono text-xs rounded-sm w-full sm:w-auto"
                >
                  {updateConfig.isPending ? (
                    <div className="flex items-center">
                      <div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                      SAVING...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      SAVE CONFIGURATION
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
