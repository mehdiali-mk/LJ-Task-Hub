import {
  Dialog,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { useCreateTaskMutation } from "@/hooks/use-task";
import { createTaskSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";
import type { ProjectMemberRole, User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, CheckSquare, FileText, Rocket, Users, XIcon, Flag } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Checkbox } from "../ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectMembers: { user: User; role: ProjectMemberRole }[];
}

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

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

export const CreateTaskDialog = ({
  open,
  onOpenChange,
  projectId,
  projectMembers,
}: CreateTaskDialogProps) => {
  const form = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "To Do",
      priority: "Medium",
      dueDate: "",
      assignees: [],
    },
  });

  const { mutate, isPending } = useCreateTaskMutation();

  const onSubmit = (values: CreateTaskFormData) => {
    mutate(
      {
        projectId,
        taskData: values,
      },
      {
        onSuccess: () => {
          toast.success("Task created successfully");
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
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
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
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-[0_8px_32px_rgba(59,130,246,0.3)] bg-gradient-to-br from-blue-500 to-indigo-600 border border-white/20"
                >
                  <CheckSquare className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-glass-heading-morph tracking-tight">Create Task</h2>
                  <p className="text-white/50 text-sm mt-1 font-light">Add a new task to your project</p>
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
                    icon={CheckSquare}
                    title="Task Title"
                  >
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70 text-sm font-medium">Task Name</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter task title..." 
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
                              placeholder="What needs to be done?"
                              rows={4}
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20 rounded-xl resize-none transition-all duration-300"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </GlassTile>

                  {/* Status & Priority Tile */}
                  <GlassTile 
                    className="md:col-span-1"
                    icon={Flag}
                    title="Status & Priority"
                  >
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/70 text-sm font-medium">Status</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="w-full bg-white/10 border-white/20 text-white rounded-xl">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900/95 border-white/20 backdrop-blur-xl">
                                  <SelectItem value="To Do">To Do</SelectItem>
                                  <SelectItem value="In Progress">In Progress</SelectItem>
                                  <SelectItem value="Done">Done</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/70 text-sm font-medium">Priority</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="w-full bg-white/10 border-white/20 text-white rounded-xl">
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900/95 border-white/20 backdrop-blur-xl">
                                  <SelectItem value="Low">Low</SelectItem>
                                  <SelectItem value="Medium">Medium</SelectItem>
                                  <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </GlassTile>

                  {/* Due Date Tile */}
                  <GlassTile 
                    className="md:col-span-1"
                    icon={CalendarIcon}
                    title="Due Date"
                  >
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70 text-sm font-medium">Select Due Date</FormLabel>
                          <FormControl>
                            <Popover modal={true}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={`w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white rounded-xl h-11 hover:bg-white/15 ${
                                    !field.value ? "text-white/40" : ""
                                  }`}
                                >
                                  <CalendarIcon className="size-4 mr-2" />
                                  {field.value ? format(new Date(field.value), "PPPP") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 z-50 bg-transparent border-none shadow-none">
                                <Calendar
                                  mode="single"
                                  selected={field.value ? new Date(field.value) : undefined}
                                  onSelect={(date) => {
                                    field.onChange(date?.toISOString() || undefined);
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </GlassTile>

                  {/* Assignees Tile */}
                  <GlassTile 
                    className="md:col-span-1"
                    icon={Users}
                    title="Assignees"
                  >
                    <FormField
                      control={form.control}
                      name="assignees"
                      render={({ field }) => {
                        const selectedMembers = field.value || [];

                        return (
                          <FormItem>
                            <FormLabel className="text-white/70 text-sm font-medium">Assign To</FormLabel>
                            <FormControl>
                              <Popover modal={true}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal min-h-11 bg-white/10 border-white/20 text-white rounded-xl hover:bg-white/15"
                                  >
                                    {selectedMembers.length === 0 ? (
                                      <span className="text-white/40">Select assignees</span>
                                    ) : selectedMembers.length <= 2 ? (
                                      selectedMembers
                                        .map((m) => {
                                          const member = projectMembers.find((wm) => wm.user._id === m);
                                          return `${member?.user.name}`;
                                        })
                                        .join(", ")
                                    ) : (
                                      `${selectedMembers.length} assignees selected`
                                    )}
                                  </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-sm max-h-60 overflow-y-auto p-2 bg-zinc-900/95 border-white/20 backdrop-blur-xl rounded-xl" align="start">
                                  <div className="flex flex-col gap-2">
                                    {projectMembers.map((member) => {
                                      const selectedMember = selectedMembers.find((m) => m === member.user?._id);
                                      return (
                                        <div key={member.user._id} className="flex items-center gap-2 p-2 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                          <Checkbox
                                            checked={!!selectedMember}
                                            onCheckedChange={(checked) => {
                                              if (checked) {
                                                field.onChange([...selectedMembers, member.user._id]);
                                              } else {
                                                field.onChange(selectedMembers.filter((m) => m !== member.user._id));
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
                                        </div>
                                      );
                                    })}
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
                    ✨ Your task will be ready instantly
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
                      className="relative overflow-hidden px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-blue-500 to-indigo-600 border border-white/20"
                      style={{ boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)' }}
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
                            Create Task
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
