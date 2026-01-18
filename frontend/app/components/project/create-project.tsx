import { projectSchema } from "@/lib/schema";
import { ProjectStatus, type MemberProps } from "@/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { format } from "date-fns";
import { CalendarIcon, FileText, FolderKanban, Rocket, Users, XIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Checkbox } from "../ui/checkbox";
import { UseCreateProject } from "@/hooks/use-project";
import { toast } from "sonner";

interface CreateProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  workspaceMembers: MemberProps[];
}

export type CreateProjectFormData = z.infer<typeof projectSchema>;

// Glassmorphic tile component matching home page style
function GlassTile({ 
  children, 
  className = "",
  icon: Icon,
  title,
}: { 
  children: React.ReactNode; 
  className?: string;
  icon?: React.ElementType;
  title?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-white/[0.08] backdrop-blur-3xl",
        "border border-white/20 ring-1 ring-white/10",
        "transition-all duration-500 ease-out",
        "hover:border-white/30 hover:bg-white/[0.12]",
        "shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
        "group",
        className
      )}
    >
      <div className="relative z-10 p-5">
        {(Icon || title) && (
          <div className="flex items-center gap-3 mb-4">
            {Icon && (
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:bg-white/15 group-hover:scale-110 shadow-lg">
                <Icon className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
              </div>
            )}
            {title && (
              <span className="text-sm font-semibold text-white/60 uppercase tracking-wider">{title}</span>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export const CreateProjectDialog = ({
  isOpen,
  onOpenChange,
  workspaceId,
  workspaceMembers,
}: CreateProjectDialogProps) => {
  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      status: ProjectStatus.PLANNING,
      startDate: "",
      dueDate: "",
      members: [],
      tags: undefined,
    },
  });
  const { mutate, isPending } = UseCreateProject();
  const startDate = form.watch("startDate");

  const onSubmit = (values: CreateProjectFormData) => {
    if (!workspaceId) return;

    mutate(
      {
        projectData: values,
        workspaceId,
      },
      {
        onSuccess: () => {
          toast.success("Project created successfully");
          form.reset();
          onOpenChange(false);
        },
        onError: (error: any) => {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage);
          console.log(error);
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} modal={true}>
      <DialogPortal>
        <DialogOverlay className="bg-black/70 backdrop-blur-md" />
        <DialogPrimitive.Content
          className={cn(
            "fixed top-[50%] left-[50%] z-50",
            "w-full max-w-[calc(100%-2rem)] sm:max-w-2xl lg:max-w-3xl",
            "translate-x-[-50%] translate-y-[-50%]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "duration-300"
          )}
        >
          {/* Main Glassmorphic Container - Home Page Style */}
          <div className="relative overflow-hidden rounded-3xl bg-white/[0.08] backdrop-blur-3xl border border-white/20 ring-1 ring-white/10 shadow-[0_20px_100px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:scale-110 group"
            >
              <XIcon className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
            </button>

            {/* Header Section */}
            <div className="relative z-10 px-8 pt-8 pb-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-[0_8px_32px_rgba(16,185,129,0.3)] bg-gradient-to-br from-emerald-500 to-teal-600 border border-white/20"
                >
                  <FolderKanban className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-glass-heading-morph tracking-tight">Create Project</h2>
                  <p className="text-white/50 text-sm mt-1 font-light">Set up a new project for your workspace</p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="relative z-10">
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title Tile - Full Width */}
                  <GlassTile 
                    className="md:col-span-2"
                    icon={FolderKanban}
                    title="Project Title"
                  >
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70 text-sm font-medium">Project Name</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter project name..." 
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20 h-12 text-lg rounded-xl transition-all duration-300"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </GlassTile>

                  {/* Description Tile */}
                  <GlassTile 
                    className="md:col-span-1"
                    icon={FileText}
                    title="Details"
                  >
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70 text-sm font-medium">Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="What's this project about?"
                              rows={4}
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20 rounded-xl resize-none transition-all duration-300"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </GlassTile>

                  {/* Status & Dates Tile */}
                  <GlassTile 
                    className="md:col-span-1"
                    icon={CalendarIcon}
                    title="Schedule"
                  >
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/70 text-sm font-medium">Status</FormLabel>
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="w-full bg-white/10 border-white/20 text-white rounded-xl">
                                  <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900/95 border-white/20 backdrop-blur-xl">
                                  {Object.values(ProjectStatus).map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white/70 text-xs font-medium">Start</FormLabel>
                              <FormControl>
                                <Popover modal={true}>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant={"outline"}
                                      className={`w-full justify-start text-left font-normal text-xs bg-white/10 border-white/20 text-white rounded-lg hover:bg-white/15 ${
                                        !field.value ? "text-white/40" : ""
                                      }`}
                                    >
                                      <CalendarIcon className="size-3 mr-1" />
                                      {field.value ? format(new Date(field.value), "MMM d") : "Pick"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0 z-50 bg-transparent border-none shadow-none" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value ? new Date(field.value) : undefined}
                                      onSelect={(date) => {
                                        field.onChange(date?.toISOString() || undefined);
                                      }}
                                      temporalConstraints={{ blockPastDate: true }}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dueDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white/70 text-xs font-medium">Due</FormLabel>
                              <FormControl>
                                <Popover modal={true}>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant={"outline"}
                                      className={`w-full justify-start text-left font-normal text-xs bg-white/10 border-white/20 text-white rounded-lg hover:bg-white/15 ${
                                        !field.value ? "text-white/40" : ""
                                      }`}
                                    >
                                      <CalendarIcon className="size-3 mr-1" />
                                      {field.value ? format(new Date(field.value), "MMM d") : "Pick"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0 z-50 bg-transparent border-none shadow-none" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value ? new Date(field.value) : undefined}
                                      onSelect={(date) => {
                                        field.onChange(date?.toISOString() || undefined);
                                      }}
                                      temporalConstraints={{
                                        blockPastDate: true,
                                        minDate: startDate ? new Date(startDate) : undefined
                                      }}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </GlassTile>

                  {/* Members Tile - Full Width */}
                  <GlassTile 
                    className="md:col-span-2"
                    icon={Users}
                    title="Team Members"
                  >
                    <FormField
                      control={form.control}
                      name="members"
                      render={({ field }) => {
                        const selectedMembers = field.value || [];
                        // Filter out members with null/undefined user objects
                        const validMembers = workspaceMembers.filter(m => m.user && m.user._id);

                        return (
                          <FormItem>
                            <FormLabel className="text-white/70 text-sm font-medium">Assign Members</FormLabel>
                            <FormControl>
                              <Popover modal={true}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className="w-full justify-start text-left font-normal min-h-11 bg-white/10 border-white/20 text-white rounded-xl hover:bg-white/15"
                                  >
                                    {selectedMembers.length === 0 ? (
                                      <span className="text-white/40">Select Members</span>
                                    ) : selectedMembers.length <= 2 ? (
                                      selectedMembers.map((m) => {
                                        const member = validMembers.find((wm) => wm.user?._id === m.user);
                                        return member ? `${member.user.name} (${member.role})` : '';
                                      }).filter(Boolean).join(", ")
                                    ) : (
                                      `${selectedMembers.length} members selected`
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full max-w-60 overflow-y-auto bg-zinc-900/95 border-white/20 backdrop-blur-xl rounded-xl" align="start">
                                  <div className="flex flex-col gap-2">
                                    {validMembers.length === 0 ? (
                                      <p className="text-white/50 text-sm text-center py-2">No members available</p>
                                    ) : (
                                      validMembers.map((member) => {
                                        const selectedMember = selectedMembers.find((m) => m.user === member.user._id);

                                        return (
                                          <div key={member._id} className="flex items-center gap-2 p-2 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                            <Checkbox
                                              checked={!!selectedMember}
                                              onCheckedChange={(checked) => {
                                                if (checked) {
                                                  field.onChange([...selectedMembers, { user: member.user._id, role: "contributor" }]);
                                                } else {
                                                  field.onChange(selectedMembers.filter((m) => m.user !== member.user._id));
                                                }
                                              }}
                                              id={`member-${member.user._id}`}
                                              className="border-white/30"
                                            />
                                            <label 
                                              htmlFor={`member-${member.user._id}`}
                                              className="truncate flex-1 cursor-pointer text-sm font-medium leading-none text-white/80"
                                            >
                                              {member.user.name}
                                            </label>

                                            {selectedMember && (
                                              <Select
                                                value={selectedMember.role}
                                                onValueChange={(role) => {
                                                  field.onChange(
                                                    selectedMembers.map((m) =>
                                                      m.user === member.user._id
                                                        ? { ...m, role: role as "contributor" | "manager" | "viewer" }
                                                        : m
                                                    )
                                                  );
                                                }}
                                              >
                                                <SelectTrigger className="w-24 h-7 text-xs bg-white/5 border-white/20">
                                                  <SelectValue placeholder="Role" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-900/95 border-white/20 backdrop-blur-xl">
                                                  <SelectItem value="manager">Manager</SelectItem>
                                                  <SelectItem value="contributor">Contributor</SelectItem>
                                                  <SelectItem value="viewer">Viewer</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            )}
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        );
                      }}
                    />
                  </GlassTile>
                </div>

                {/* Footer Actions */}
                <div className="relative z-10 px-8 py-6 border-t border-white/10 flex items-center justify-between gap-4">
                  <p className="text-white/40 text-sm hidden sm:block font-light">
                    ✨ Your project will be ready instantly
                  </p>
                  <div className="flex items-center gap-3 ml-auto">
                    <Button 
                      type="button" 
                      variant="ghost"
                      onClick={() => onOpenChange(false)}
                      className="text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isPending}
                      className="relative overflow-hidden px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-emerald-500 to-teal-600 border border-white/20"
                      style={{ boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)' }}
                    >
                      <span className="flex items-center gap-2">
                        {isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Rocket className="w-4 h-4" />
                            Create Project
                          </>
                        )}
                      </span>
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};
