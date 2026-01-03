import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UseUpdateProject } from "@/hooks/use-project";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { Project } from "@/types";
import { Loader2 } from "lucide-react";

interface EditProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

interface EditProjectForm {
  title: string;
  description: string;
}

export const EditProjectDialog = ({
  isOpen,
  onOpenChange,
  project,
}: EditProjectDialogProps) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditProjectForm>({
      defaultValues: {
          title: project.title,
          description: project.description
      }
  });

  const { mutate: updateProject, isPending } = UseUpdateProject();

  useEffect(() => {
      if (project) {
          reset({
              title: project.title,
              description: project.description
          });
      }
  }, [project, reset]);

  const onSubmit = (data: EditProjectForm) => {
    updateProject(
      {
        projectId: project._id,
        title: data.title,
        description: data.description,
      },
      {
        onSuccess: () => {
          toast.success("Project updated successfully");
          onOpenChange(false);
        },
        onError: () => {
          toast.error("Failed to update project");
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Project Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Project Title"
              {...register("title", { required: "Title is required" })}
              className="bg-white/5 border-white/10"
            />
            {errors.title && (
              <span className="text-xs text-red-500">{errors.title.message}</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Project Description"
              {...register("description")}
              className="bg-white/5 border-white/10 min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
