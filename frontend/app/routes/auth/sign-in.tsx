import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { useLoginMutation, useVerifyEmailMutation, useVerify2FAMutation } from "@/hooks/use-auth";
import { signInSchema } from "@/lib/schema";
import { useAuth } from "@/provider/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useState } from "react";
import { OTPVerification } from "@/components/ui/otp-input";

type SigninFormData = z.infer<typeof signInSchema>;

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [is2FAVerifying, setIs2FAVerifying] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [pending2FAUserId, setPending2FAUserId] = useState<string | null>(null);

  const form = useForm<SigninFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });
  const { mutate, isPending } = useLoginMutation();
  const { mutateAsync: verifyEmail } = useVerifyEmailMutation();
  const { mutateAsync: verify2FA } = useVerify2FAMutation();

  const handleOnSubmit = (values: SigninFormData) => {
    mutate(values, {
      onSuccess: (data: any) => {
        if (data.token) {
            // Normal Login (2FA not enabled)
            login(data);
            toast.success("Login successful");
            navigate("/dashboard");
        } else if (data.requires2FA) {
            // 2FA Required
            setPending2FAUserId(data.userId);
            setIdentifier(values.identifier);
            setIs2FAVerifying(true);
            toast.info("2FA code sent to your email");
        } else {
            // Email Verification Required (Backend sent message but no token)
            setIdentifier(values.identifier);
            setIsVerifying(true);
            toast.info(data.message || "Verification required");
        }
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        console.log(error);
        toast.error(errorMessage);
      },
    });
  };

  // Handle 2FA OTP verification
  const handle2FAVerify = async (otp: string): Promise<boolean> => {
    if (!pending2FAUserId) return false;
    try {
      const data = await verify2FA({ userId: pending2FAUserId, otp });
      login(data as any);
      toast.success("Login successful");
      navigate("/dashboard");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid code");
      return false;
    }
  };

  // Handle email verification OTP
  const handleVerifyOTP = async (otp: string): Promise<boolean> => {
    try {
      await verifyEmail({ identifier: identifier, otp });
      toast.success("Verified successfully! Please login.");
      setIsVerifying(false);
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid code");
      return false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Link to="/" className="flex items-center gap-3 mb-8 group cursor-pointer">
        <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center transition-all duration-300 backdrop-blur-md overflow-hidden
          group-hover:bg-white
          group-hover:border-white/70
          group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(0,0,0,0.1),0_4px_16px_rgba(0,0,0,0.2),0_0_20px_rgba(255,255,255,0.15)]
          group-hover:-translate-y-0.5">
           <DotLottieReact
             src="https://lottie.host/2bd99e49-b27f-4ad1-a9fd-4c7272da3bbe/hgKC6qcLgu.lottie"
             loop
             autoplay
             style={{ width: '56px', height: '56px', transform: 'scale(1.4)' }}
           />
        </div>
        <span className="font-bold text-2xl tracking-tighter text-white/90 group-hover:text-white transition-colors">TaskForge</span>
      </Link>
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center mb-5">
          <CardTitle className="text-2xl font-bold text-glass-heading-morph">
            {is2FAVerifying ? "Two-Factor Authentication" : isVerifying ? "Verify Account" : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-sm text-white/50">
             {is2FAVerifying 
               ? "Enter the 6-digit code sent to your email"
               : isVerifying 
               ? `Enter the code sent to ${identifier}` 
               : "Sign in to your account to continue"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {is2FAVerifying ? (
            <OTPVerification 
              onVerify={handle2FAVerify}
              description="Check your email for the 2FA code."
            />
          ) : isVerifying ? (
            <OTPVerification 
              onVerify={handleVerifyOTP}
              description="Check your email for the 6-digit code."
            />
          ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleOnSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="email@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-white/60 hover:text-white transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="********"
                            {...field}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <Loader2 className="w-4 h-4 mr-2" /> : "Login"}
              </Button>
            </form>
          </Form>
          )}

          {!isVerifying && (
            <CardFooter className="flex items-center justify-center mt-6 p-0">
                <div className="flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account? <Link to="/sign-up">Sign up</Link>
                </p>
                </div>
            </CardFooter>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
