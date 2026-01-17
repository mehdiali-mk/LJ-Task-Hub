import type { Comment, User } from "@/types";
import { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  useAddCommentMutation,
  useDeleteCommentMutation,
  useGetCommentsByTaskIdQuery,
} from "@/hooks/use-task";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Loader } from "../loader";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/provider/auth-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

interface CommentSectionProps {
  taskId: string;
  members: User[];
  canDeleteAnyComment?: boolean; // Admin, Workspace Manager, or Project Manager
}

export const CommentSection = ({
  taskId,
  members,
  canDeleteAnyComment = false,
}: CommentSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();

  const { mutate: addComment, isPending } = useAddCommentMutation();
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteCommentMutation();
  const { data: comments, isLoading } = useGetCommentsByTaskIdQuery(taskId) as {
    data: Comment[];
    isLoading: boolean;
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    addComment(
      { taskId, text: newComment },
      {
        onSuccess: () => {
          setNewComment("");
          toast.success("Comment added successfully");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to add comment");
          console.log(error);
        },
      }
    );
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment(
      { taskId, commentId },
      {
        onSuccess: () => {
          toast.success("Comment deleted successfully");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to delete comment");
          console.log(error);
        },
      }
    );
  };

  // Check if current user can delete a specific comment
  const canDeleteComment = (comment: Comment): boolean => {
    // Admin, Workspace Manager, or Project Manager can delete any comment
    if (canDeleteAnyComment) return true;
    
    // Regular users can only delete their own comments
    const isOwnComment = comment.author._id === user?._id || 
                         comment.author._id?.toString() === user?._id?.toString();
    return isOwnComment;
  };

  if (isLoading)
    return (
      <div>
        <Loader />
      </div>
    );

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-medium mb-4">Comments</h3>

      <ScrollArea className="h-[300px] mb-4">
        {comments?.length > 0 ? (
          comments.map((comment) => {
            const showDeleteButton = canDeleteComment(comment);
            
            return (
              <div key={comment._id} className="flex gap-4 py-2 group">
                <Avatar className="size-8">
                  <AvatarImage src={comment.author.profilePicture} />
                  <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">
                      {comment.author.name}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(comment.createdAt, {
                          addSuffix: true,
                        })}
                      </span>

                      {/* Delete button - only show if user can delete this comment */}
                      {showDeleteButton && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white text-xl font-bold">Delete Comment</AlertDialogTitle>
                              <AlertDialogDescription className="text-white/60">
                                Are you sure you want to delete this comment? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteComment(comment._id)}
                                className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 border border-white/20"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{comment.text}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">No comment yet</p>
          </div>
        )}
      </ScrollArea>

      <Separator className="my-4" />

      <div className="mt-4">
        <Textarea
          placeholder="Add a comment"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />

        <div className="flex justify-end mt-4">
          <Button
            disabled={!newComment.trim() || isPending}
            onClick={handleAddComment}
          >
            Post Comment
          </Button>
        </div>
      </div>
    </div>
  );
};
