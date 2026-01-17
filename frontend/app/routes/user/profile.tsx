import { BackButton } from "@/components/back-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  useChangePassword,
  useUpdateUserProfile,
  useUserProfileQuery,
} from "@/hooks/use-user";
import { useAuth } from "@/provider/auth-context";
import { useSendVerificationMutation, useVerifyEmailMutation, useEnable2FAMutation, useDisable2FAMutation } from "@/hooks/use-auth";
import type { User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Calendar as CalendarIcon, Code, PenTool, Plus, Trash2, User as UserIcon } from "lucide-react";
import { DesignationLabel, type DesignationType } from "@/components/portfolio/designation-label";
import { TimelineNode } from "@/components/portfolio/timeline-node";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { AlertCircle, Camera, CheckCircle, Loader, Loader2, Shield, XCircle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

import { CameraModal } from "@/components/profile/camera-capture";
import { postData } from "@/lib/fetch-util";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OTPVerification } from "@/components/ui/otp-input";

/**
 * Upload image to Cloudinary via backend API
 */
async function uploadToCloudinary(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const response = await postData("/upload/image", { 
          image: base64,
          folder: "profile-pictures" 
        }) as { url: string };
        resolve(response.url);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
    newPassword: z.string().min(8, { message: "New password is required" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Confirm password is required" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const experienceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  startDate: z.string().min(1, "Start date is required"), // Store as ISO string or Date
  endDate: z.string().optional().nullable(),
  description: z.string().optional(),
});

const profileSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  profilePicture: z.string().optional(),
  email: z.string().email("Invalid email address"),
  // Portfolio
  description: z.string().optional(),
  designation: z.enum(["Developer", "Designer", "Manager", "Product Owner", "Other"]).default("Other"),
  expertise: z.array(z.string()).optional(),
  experience: z.array(experienceSchema).optional(),
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const { data: user, isPending } = useUserProfileQuery() as {
    data: User;
    isPending: boolean;
  };
  const { user: authUser, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // Hooks for Verification
  const { mutateAsync: sendVerification, isPending: isSendingCode } = useSendVerificationMutation();
  const { mutateAsync: verifyEmail } = useVerifyEmailMutation();
  
  // 2FA Mutations
  const { mutateAsync: enable2FA, isPending: isEnabling2FA } = useEnable2FAMutation();
  const { mutateAsync: disable2FA, isPending: isDisabling2FA } = useDisable2FAMutation();

  // Sync AuthContext with fresh API data
  useEffect(() => {
    if (user && JSON.stringify(user) !== JSON.stringify(authUser)) {
      updateUser(user);
    }
  }, [user, authUser, updateUser]);

  // Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  // Initialize 2FA enabled status from user
  useEffect(() => {
    if (user?.is2FAEnabled !== undefined) {
      setMfaEnabled(user.is2FAEnabled);
    }
  }, [user?.is2FAEnabled]);
  const [mfaEnabled, setMfaEnabled] = useState(user?.is2FAEnabled || false);
  const [is2FAEnableDialogOpen, setIs2FAEnableDialogOpen] = useState(false);
  const [is2FADisableDialogOpen, setIs2FADisableDialogOpen] = useState(false);

  // Check if user is Master Admin (simplify profile for admin) - SSR safe
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    setIsAdmin(!!localStorage.getItem("admin_token"));
  }, []);

  // Verification State
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      profilePicture: user?.profilePicture || "",
      email: user?.email || "",
      description: user?.description || "",
      designation: (user?.designation as DesignationType) || "Other",
      expertise: user?.expertise || [],
      experience: (user?.experience as any[]) || [],
    },
    values: {
      name: user?.name || "",
      profilePicture: user?.profilePicture || "",
      email: user?.email || "",
      description: user?.description || "",
      designation: (user?.designation as DesignationType) || "Other",
      expertise: user?.expertise || [],
      experience: (user?.experience as any[]) || [],
    },
  });

  const { mutate: updateUserProfile, isPending: isUpdatingProfile } =
    useUpdateUserProfile();
  const {
    mutate: changePassword,
    isPending: isChangingPassword,
    error,
  } = useChangePassword();

  const handlePasswordChange = (values: ChangePasswordFormData) => {
    changePassword(values, {
      onSuccess: () => {
        toast.success(
          "Password updated successfully. You will be logged out. Please login again."
        );
        form.reset();

        setTimeout(() => {
          logout();
          navigate("/sign-in");
        }, 3000);
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.error || "Failed to update password";
        toast.error(errorMessage);
        console.log(error);
      },
    });
  };

  const handleProfileFormSubmit = (values: ProfileFormData) => {
    updateUserProfile(
      values,
      {
        onSuccess: () => {
          toast.success("Profile updated successfully");
          if (user) {
             // Check if email changed to reset verification
             const isEmailChanged = values.email !== user.email;
             
             updateUser({ 
                 ...user, 
                 ...values, 
                 isEmailVerified: isEmailChanged ? false : user.isEmailVerified,
             });
          }
        },
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.message || "Failed to update profile";
          toast.error(errorMessage);
          console.log(error);
        },
      }
    );
  };

  // Handle camera capture
  const handleCameraCapture = async (blob: Blob) => {
    try {
      toast.loading("Uploading photo...");
      const imageUrl = await uploadToCloudinary(blob);
      profileForm.setValue("profilePicture", imageUrl);
      toast.dismiss();
      toast.success("Photo uploaded successfully!");
      // We can trigger an update here if we want to save immediately, 
      // but usually we wait for user to click Save. 
      // Existing logic triggered update. I'll invoke handleSubmit logic or similar.
      // But handleSubmit requires values. 
      // I'll manually trigger update or let user click Save.
      // The previous implementation called updateUser directly. I'll stick to that strictly for image.
      if (user) {
         updateUserProfile({ ...profileForm.getValues(), profilePicture: imageUrl }, {
             onSuccess: () => {
                 updateUser({ ...user, profilePicture: imageUrl });
             }
         });
      }
      setIsCameraOpen(false);
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to upload photo");
      console.error(err);
    }
  };

  // Handle Verification Start (Email only)
  const handleStartVerification = async () => {
    try {
        await sendVerification({ channel: "email" });
        toast.success("Verification code sent to your email.");
        setIsVerifyModalOpen(true);
    } catch (error: any) {
        toast.error(error.message || "Failed to send verification code");
        console.error(error);
    }
  };

  // Handle OTP Submit
  const handleVerifyOTP = async (otp: string): Promise<boolean> => {
    if (!user?.email) {
        toast.error("No email found to verify");
        return false;
    }

    try {
        await verifyEmail({ identifier: user.email, otp });
        toast.success("Email verified!");
        updateUser({ ...user, isEmailVerified: true });
        setIsVerifyModalOpen(false);
        return true;
    } catch (error: any) {
        toast.error(error.message || "Invalid Code");
        return false;
    }
  };

  if (isPending)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin" />
      </div>
    );

  return (
    <div className="space-y-8">
      <div className="px-4 md:px-0">
        <BackButton />
        <h3 className="text-lg font-medium text-glass-primary">Profile Information</h3>
        <p className="text-sm text-glass-secondary">
          Manage your account settings and preferences.
        </p>
      </div>

      <Separator className="bg-white/10" />

      {/* Personal Information Card */}
      <Card className="deep-glass border-none">
        <CardHeader>
          <CardTitle className="text-glass-primary">Personal Information</CardTitle>
          <CardDescription className="text-glass-secondary">Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(handleProfileFormSubmit)}
              className="grid gap-4"
            >
              {/* Avatar Section */}
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-20 w-20 bg-gray-600 ring-2 ring-white/10">
                  <AvatarImage
                    src={
                      profileForm.watch("profilePicture") ||
                      user?.profilePicture
                    }
                    alt={user?.name}
                  />
                  <AvatarFallback className="text-xl bg-gray-700 text-glass-primary">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          toast.loading("Uploading image...");
                          const imageUrl = await uploadToCloudinary(file);
                          profileForm.setValue("profilePicture", imageUrl);
                          toast.dismiss();
                          toast.success("Image uploaded to Cloudinary!");
                          // Auto save on upload
                          if (user) {
                            updateUserProfile({ ...profileForm.getValues(), profilePicture: imageUrl }, {
                                onSuccess: () => updateUser({ ...user, profilePicture: imageUrl })
                            });
                          }
                        } catch (err) {
                          toast.dismiss();
                          toast.error("Failed to upload image");
                          console.error(err);
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="btn-glass"
                    onClick={() =>
                      document.getElementById("avatar-upload")?.click()
                    }
                  >
                    Upload
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="btn-glass"
                    onClick={() => setIsCameraOpen(true)}
                  >
                    <Camera className="w-4 h-4 mr-1" />
                    Take Photo
                  </Button>
                </div>
              </div>

              {/* Name Field */}
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-glass-secondary">Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="input-glass" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Section with Status - Hidden for Admin */}
              {!isAdmin && (
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="email" className="text-glass-secondary">Email Address</Label>
                    <div className="flex items-center gap-2">
                       {/* Show status only if saved email matches current input? Or just specific to SAVED state. 
                           The status belongs to the SAVED user. 
                           If user types a new email, the status is technically "Pending Save". 
                           But we stick to showing User status. */}
                       {user?.isEmailVerified ? (
                           <span className="flex items-center text-green-400 text-xs font-medium">
                               <CheckCircle className="w-3 h-3 mr-1" /> Verified
                           </span>
                       ) : (
                           <span className="flex items-center text-red-400 text-xs font-medium">
                               <XCircle className="w-3 h-3 mr-1" /> Not verified
                           </span>
                       )}
                       {!user?.isEmailVerified && user?.email && (
                           <Button size="sm" variant="ghost" className="h-6 text-xs text-blue-400 hover:text-blue-300" 
                             onClick={() => handleStartVerification()} 
                             type="button"
                             disabled={isSendingCode}
                           >
                               Verify Now
                           </Button>
                       )}
                    </div>
                </div>
                 <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} type="email" className="input-glass" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
              )}

              {/* Professional Portfolio Section - Hidden for Admin */}
              {!isAdmin && (
              <div className="space-y-6 pt-4 border-t border-white/10 mt-4 text-left">
                <div className="flex items-center gap-2 text-glass-primary pb-2">
                   <Briefcase className="w-5 h-5 kinetic-icon" />
                   <h4 className="text-lg font-medium">Professional Portfolio</h4>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                   {/* Designation */}
                   <FormField
                      control={profileForm.control}
                      name="designation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-glass-secondary">Designation</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="input-glass">
                                <SelectValue placeholder="Select designation" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="deep-glass border-white/10">
                               <SelectItem value="Developer">Developer</SelectItem>
                               <SelectItem value="Designer">Designer</SelectItem>
                               <SelectItem value="Manager">Manager</SelectItem>
                               <SelectItem value="Product Owner">Product Owner</SelectItem>
                               <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="mt-2 text-xs text-glass-muted flex items-center">
                             Preview: <DesignationLabel type={field.value} className="ml-2 scale-90 origin-left" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Expertise (Tags) */}
                    <FormField
                      control={profileForm.control}
                      name="expertise"
                      render={({ field }) => (
                         <FormItem>
                            <FormLabel className="text-glass-secondary">Areas of Expertise</FormLabel>
                            <FormControl>
                               <div className="space-y-3">
                                  <div className="flex gap-2">
                                     <Input 
                                        placeholder="Add skill (e.g. React, UX)" 
                                        className="input-glass"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const val = (e.currentTarget as HTMLInputElement).value.trim();
                                                if (val && !field.value?.includes(val)) {
                                                    field.onChange([...(field.value || []), val]);
                                                    (e.currentTarget as HTMLInputElement).value = '';
                                                }
                                            }
                                        }}
                                     />
                                  </div>
                                  <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-md border border-white/5 bg-black/20">
                                      {field.value?.map((tag, i) => (
                                          <Badge key={i} variant="outline" className="bg-white/5 border-white/10 text-glass-primary pr-1 gap-1 hover:bg-white/10 transition-colors">
                                              {tag}
                                              <button type="button" onClick={() => {
                                                  const newTags = [...(field.value || [])];
                                                  newTags.splice(i, 1);
                                                  field.onChange(newTags);
                                              }}>
                                                  <Trash2 className="w-3 h-3 text-red-400 hover:text-red-300" />
                                              </button>
                                          </Badge>
                                      ))}
                                      {(!field.value || field.value.length === 0) && (
                                          <span className="text-xs text-glass-muted self-center italic px-1">No skills added yet</span>
                                      )}
                                  </div>
                               </div>
                            </FormControl>
                            <FormMessage />
                         </FormItem>
                      )}
                    />
                </div>

                {/* Description (Markdown) */}
                <FormField
                  control={profileForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-glass-secondary">Professional Summary (Markdown)</FormLabel>
                      <FormControl>
                        <Textarea 
                            {...field} 
                            className="input-glass min-h-[120px] font-mono text-sm" 
                            placeholder="Write about your journey..." 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Experience Timeline Editor - Simplified for MVP */}
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                       <Label className="text-glass-secondary">Experience Timeline</Label>
                       <Button type="button" size="sm" variant="outline" className="btn-glass h-7" onClick={() => {
                           // Add a placeholder experience entry
                           const currentExp = profileForm.getValues("experience") || [];
                           profileForm.setValue("experience", [
                               {
                                   title: "Role Title",
                                   company: "Company Name",
                                   startDate: new Date().toISOString(),
                                   description: ""
                               },
                               ...currentExp
                           ]);
                       }}>
                           <Plus className="w-3 h-3 mr-1" /> Add Role
                       </Button>
                   </div>
                   
                   <div className="space-y-4">
                       <FormField
                          control={profileForm.control}
                          name="experience"
                          render={({ field }) => (
                            <div className="space-y-4">
                                {field.value?.map((exp, index) => (
                                    <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3 relative group">
                                         <button 
                                            type="button" 
                                            className="absolute top-2 right-2 text-glass-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => {
                                                const newExp = [...(field.value || [])];
                                                newExp.splice(index, 1);
                                                field.onChange(newExp);
                                            }}
                                         >
                                             <Trash2 className="w-4 h-4" />
                                         </button>
                                         
                                         <div className="grid grid-cols-2 gap-3">
                                             <div className="space-y-1">
                                                 <Label className="text-xs text-glass-muted">Title</Label>
                                                 <Input 
                                                    value={exp.title} 
                                                    onChange={(e) => {
                                                        const newExp = [...(field.value || [])];
                                                        newExp[index].title = e.target.value;
                                                        field.onChange(newExp);
                                                    }}
                                                    className="input-glass h-8 text-sm" 
                                                 />
                                             </div>
                                             <div className="space-y-1">
                                                 <Label className="text-xs text-glass-muted">Company</Label>
                                                 <Input 
                                                    value={exp.company} 
                                                    onChange={(e) => {
                                                        const newExp = [...(field.value || [])];
                                                        newExp[index].company = e.target.value;
                                                        field.onChange(newExp);
                                                    }}
                                                    className="input-glass h-8 text-sm" 
                                                 />
                                             </div>
                                         </div>
                                         <div className="grid grid-cols-2 gap-3">
                                             <div className="space-y-1">
                                                 <Label className="text-xs text-glass-muted">Start Date</Label>
                                                 <Input 
                                                    type="date"
                                                    value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ''} 
                                                    onChange={(e) => {
                                                        const newExp = [...(field.value || [])];
                                                        newExp[index].startDate = e.target.value;
                                                        field.onChange(newExp);
                                                    }}
                                                    className="input-glass h-8 text-sm" 
                                                 />
                                             </div>
                                             <div className="space-y-1">
                                                 <Label className="text-xs text-glass-muted">End Date (Leave empty for Present)</Label>
                                                 <Input 
                                                    type="date"
                                                    value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ''} 
                                                    onChange={(e) => {
                                                        const newExp = [...(field.value || [])];
                                                        newExp[index].endDate = e.target.value || null;
                                                        field.onChange(newExp);
                                                    }}
                                                    className="input-glass h-8 text-sm" 
                                                 />
                                             </div>
                                         </div>
                                         <div className="space-y-1">
                                             <Label className="text-xs text-glass-muted">Description</Label>
                                             <Textarea 
                                                value={exp.description || ""} 
                                                onChange={(e) => {
                                                    const newExp = [...(field.value || [])];
                                                    newExp[index].description = e.target.value;
                                                    field.onChange(newExp);
                                                }}
                                                className="input-glass min-h-[60px] text-sm" 
                                             />
                                         </div>
                                         
                                         {/* Preview of Node */}
                                         <div className="mt-2 pt-2 border-t border-white/5">
                                             <Label className="text-xs text-glass-muted mb-2 block">Visual Preview</Label>
                                             <div className="pl-2">
                                                 <TimelineNode 
                                                    title={exp.title || "Title"} 
                                                    company={exp.company || "Company"} 
                                                    startDate={exp.startDate || new Date()} 
                                                    endDate={exp.endDate} 
                                                    description={exp.description}
                                                    isLast={true} 
                                                 />
                                             </div>
                                         </div>
                                    </div>
                                ))}
                            </div>
                          )}
                       />
                   </div>
                </div>

              </div>
              )}

              <Button
                type="submit"
                className="w-fit btn-glass-primary mt-4"
                disabled={isUpdatingProfile || isPending}
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication Card - Hidden for Admin */}
      {!isAdmin && (
      <Card className="deep-glass border-none">
        <CardHeader>
          <CardTitle className="text-glass-primary flex items-center gap-2">
            <Shield className="w-5 h-5 kinetic-icon" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription className="text-glass-secondary">
            Add an extra layer of security to your account. When enabled, you'll receive an OTP via email every time you log in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mfaEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-400'}`}>
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-white">Email 2FA</p>
                <p className="text-sm text-gray-400">
                  {mfaEnabled ? "Enabled - OTP sent on every login" : "Disabled"}
                </p>
              </div>
            </div>
            
            {/* Show enable/disable based on current state */}
            {mfaEnabled ? (
              <Button 
                variant="outline" 
                className="text-rose-400 border-rose-400/30 hover:bg-rose-400/10"
                onClick={() => setIs2FADisableDialogOpen(true)}
              >
                Disable
              </Button>
            ) : user?.isEmailVerified ? (
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setIs2FAEnableDialogOpen(true)}
              >
                Enable
              </Button>
            ) : (
              <div className="text-sm text-amber-400">
                Verify email first
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      )}

      {/* 2FA Enable Confirmation Modal - Using Portal for proper centering */}
      {is2FAEnableDialogOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIs2FAEnableDialogOpen(false)}
          />
          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-md mx-4 p-6 rounded-xl bg-zinc-900 border border-white/10 shadow-2xl">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setIs2FAEnableDialogOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-white mb-2">Enable Two-Factor Authentication?</h2>
            <p className="text-gray-400 text-sm mb-6">
              Once enabled, you will receive a 6-digit OTP via email every time you log in. Make sure you have access to your email.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIs2FAEnableDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={async () => {
                  try {
                    await enable2FA();
                    setMfaEnabled(true);
                    if (user) updateUser({ ...user, is2FAEnabled: true });
                    toast.success("Two-factor authentication enabled! You will receive an OTP on login.");
                    setIs2FAEnableDialogOpen(false);
                  } catch (error: any) {
                    toast.error(error.response?.data?.message || "Failed to enable 2FA");
                  }
                }}
              >
                Enable 2FA
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 2FA Disable Confirmation Modal - Using Portal for proper centering */}
      {is2FADisableDialogOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIs2FADisableDialogOpen(false)}
          />
          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-md mx-4 p-6 rounded-xl bg-zinc-900 border border-white/10 shadow-2xl">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setIs2FADisableDialogOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-white mb-2">Disable Two-Factor Authentication?</h2>
            <p className="text-gray-400 text-sm mb-6">
              This will remove the extra security layer from your account. You will no longer need to enter an OTP when logging in.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIs2FADisableDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={async () => {
                  try {
                    await disable2FA();
                    setMfaEnabled(false);
                    if (user) updateUser({ ...user, is2FAEnabled: false });
                    toast.success("Two-factor authentication disabled");
                    setIs2FADisableDialogOpen(false);
                  } catch (error: any) {
                    toast.error(error.response?.data?.message || "Failed to disable 2FA");
                  }
                }}
              >
                Disable 2FA
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Password Card */}
      <Card className="deep-glass border-none">
        <CardHeader>
          <CardTitle className="text-glass-primary">Change Password</CardTitle>
          <CardDescription className="text-glass-secondary">Update your password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handlePasswordChange)}
              className="grid gap-4"
            >
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-glass-secondary">Current Password</FormLabel>
                      <FormControl>
                        <Input
                          id="current-password"
                          type="password"
                          placeholder="********"
                          {...field}
                          className="input-glass"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-glass-secondary">New Password</FormLabel>
                      <FormControl>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="********"
                          {...field}
                          className="input-glass"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-glass-secondary">Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          id="confirm-password"
                          placeholder="********"
                          type="password"
                          {...field}
                          className="input-glass"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="mt-2 w-fit btn-glass-primary"
                disabled={isPending || isChangingPassword}
              >
                {isPending || isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onCapture={handleCameraCapture}
        onClose={() => setIsCameraOpen(false)}
      />

      {/* Email Verification Dialog */}
      <Dialog open={isVerifyModalOpen} onOpenChange={setIsVerifyModalOpen}>
        <DialogContent className="deep-glass border-white/10 text-white sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Verify Email Address</DialogTitle>
                <DialogDescription className="text-gray-400">
                    Enter the code sent to your email.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
               <OTPVerification onVerify={handleVerifyOTP} />
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
