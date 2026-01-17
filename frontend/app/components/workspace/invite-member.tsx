import type { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { inviteMemberSchema } from "@/lib/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Mail } from "lucide-react";
import { useInviteMemberMutation } from "@/hooks/use-workspace";
import { toast } from "sonner";

interface InviteMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}
export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

export const InviteMemberDialog = ({
  isOpen,
  onOpenChange,
  workspaceId,
}: InviteMemberDialogProps) => {
  const form = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutate, isPending } = useInviteMemberMutation();

  const onSubmit = async (data: InviteMemberFormData) => {
    if (!workspaceId) return;

    mutate(
      {
        workspaceId,
        email: data.email,
      },
      {
        onSuccess: () => {
          toast.success("Invitation sent successfully! The user will receive an email with a direct link to join.");
          form.reset();
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to send invitation");
          console.log(error);
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite to Workspace</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <p className="text-sm text-muted-foreground">
            Enter the email address of the user you want to invite. They will receive an email with a direct link to join this workspace.
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col space-y-4 w-full">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter email address" 
                          type="email"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                className="mt-6 w-full"
                size={"lg"}
                disabled={isPending}
              >
                <Mail className="w-4 h-4 mr-2" />
                {isPending ? "Sending..." : "Send Invitation"}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
