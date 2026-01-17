import { workspaceSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "../ui/button";
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
import { useCreateWorkspace } from "@/hooks/use-workspace";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { 
  XIcon, 
  Sparkles, 
  Palette, 
  FileText, 
  Layers, 
  Check,
  Rocket
} from "lucide-react";

interface CreateWorkspaceProps {
  isCreatingWorkspace: boolean;
  setIsCreatingWorkspace: (isCreatingWorkspace: boolean) => void;
}

// Define 8 predefined colors with gradient pairs
export const colorOptions = [
  { primary: "#FF5733", secondary: "#FF8F6B", name: "Coral" },
  { primary: "#33C1FF", secondary: "#6BDDFF", name: "Sky" },
  { primary: "#28A745", secondary: "#5CD87A", name: "Emerald" },
  { primary: "#FFC300", secondary: "#FFE066", name: "Gold" },
  { primary: "#8E44AD", secondary: "#B879D1", name: "Purple" },
  { primary: "#E67E22", secondary: "#F4A460", name: "Orange" },
  { primary: "#2ECC71", secondary: "#7EE8A8", name: "Mint" },
  { primary: "#34495E", secondary: "#5D6D7E", name: "Slate" },
];

export type WorkspaceForm = z.infer<typeof workspaceSchema>;

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

export const CreateWorkspace = ({
  isCreatingWorkspace,
  setIsCreatingWorkspace,
}: CreateWorkspaceProps) => {
  const form = useForm<WorkspaceForm>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
      color: colorOptions[0].primary,
      description: "",
    },
  });
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateWorkspace();
  const selectedColor = form.watch("color");
  const workspaceName = form.watch("name");

  const onSubmit = (data: WorkspaceForm) => {
    mutate(data, {
      onSuccess: (data: any) => {
        form.reset();
        setIsCreatingWorkspace(false);
        toast.success("Workspace created successfully");
        navigate(`/workspaces/${data._id}`);
      },
      onError: (error: any) => {
        const errorMessage = error.response.data.message;
        toast.error(errorMessage);
        console.log(error);
      },
    });
  };

  const selectedColorData = colorOptions.find(c => c.primary === selectedColor) || colorOptions[0];

  return (
    <Dialog
      open={isCreatingWorkspace}
      onOpenChange={setIsCreatingWorkspace}
      modal={true}
    >
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
          <div className="relative overflow-hidden rounded-3xl bg-white/[0.08] backdrop-blur-3xl border border-white/20 ring-1 ring-white/10 shadow-[0_20px_100px_rgba(0,0,0,0.5)]">
            
            {/* Close Button */}
            <button
              onClick={() => setIsCreatingWorkspace(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:scale-110 group"
            >
              <XIcon className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
            </button>

            {/* Header Section */}
            <div className="relative z-10 px-8 pt-8 pb-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20"
                  style={{
                    background: `linear-gradient(135deg, ${selectedColor}, ${selectedColorData.secondary})`,
                  }}
                >
                  <Layers className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-glass-heading-morph tracking-tight">Create Workspace</h2>
                  <p className="text-white/50 text-sm mt-1 font-light">Set up a new collaborative space for your team</p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="relative z-10">
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name Tile - Full Width */}
                  <GlassTile 
                    className="md:col-span-2"
                    icon={Sparkles}
                    title="Workspace Identity"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70 text-sm font-medium">Workspace Name</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter a memorable name..." 
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
                              placeholder="What's this workspace for?"
                              rows={4}
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20 rounded-xl resize-none transition-all duration-300"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </GlassTile>

                  {/* Color Palette Tile */}
                  <GlassTile 
                    className="md:col-span-1"
                    icon={Palette}
                    title="Theme Color"
                  >
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70 text-sm font-medium">
                            Choose a Color
                            <span className="ml-2 text-xs text-white/40">• {selectedColorData.name}</span>
                          </FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-4 gap-3 mt-3">
                              {colorOptions.map((color) => (
                                <button
                                  key={color.primary}
                                  type="button"
                                  onClick={() => field.onChange(color.primary)}
                                  className={cn(
                                    "relative w-full aspect-square rounded-xl cursor-pointer transition-all duration-300",
                                    "hover:scale-110 hover:shadow-lg group/color border border-white/20",
                                    field.value === color.primary && "ring-2 ring-white ring-offset-2 ring-offset-transparent scale-105"
                                  )}
                                  style={{ 
                                    background: `linear-gradient(135deg, ${color.primary}, ${color.secondary})`,
                                    boxShadow: field.value === color.primary ? `0 8px 24px ${color.primary}60` : 'none',
                                  }}
                                >
                                  {field.value === color.primary && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Check className="w-5 h-5 text-white drop-shadow-lg" />
                                    </div>
                                  )}
                                  <span className="sr-only">{color.name}</span>
                                </button>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </GlassTile>

                  {/* Preview Tile - Full Width */}
                  <div className="md:col-span-2">
                    <div 
                      className="relative overflow-hidden rounded-2xl p-6 transition-all duration-500 bg-white/[0.08] backdrop-blur-3xl border border-white/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-lg transition-all duration-500 border border-white/20"
                            style={{
                              background: `linear-gradient(135deg, ${selectedColor}, ${selectedColorData.secondary})`,
                            }}
                          >
                            {workspaceName ? workspaceName.charAt(0).toUpperCase() : "W"}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-lg">
                              {workspaceName || "Workspace Preview"}
                            </h3>
                            <p className="text-white/50 text-sm">Preview of your workspace appearance</p>
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-white/60 text-sm">Live Preview</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="relative z-10 px-8 py-6 border-t border-white/10 flex items-center justify-between gap-4">
                  <p className="text-white/40 text-sm hidden sm:block font-light">
                    ✨ Your workspace will be ready instantly
                  </p>
                  <div className="flex items-center gap-3 ml-auto">
                    <Button 
                      type="button" 
                      variant="ghost"
                      onClick={() => setIsCreatingWorkspace(false)}
                      className="text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isPending}
                      className="relative overflow-hidden px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border border-white/20"
                      style={{
                        background: `linear-gradient(135deg, ${selectedColor}, ${selectedColorData.secondary})`,
                        boxShadow: `0 8px 32px ${selectedColor}40`,
                      }}
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
                            Create Workspace
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
