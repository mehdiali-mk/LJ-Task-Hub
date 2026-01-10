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
import { useLoginMutation, useVerifyEmailMutation } from "@/hooks/use-auth";
import { signInSchema } from "@/lib/schema";
import { useAuth } from "@/provider/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Layers, Eye, EyeOff } from "lucide-react";
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
  const [identifier, setIdentifier] = useState("");

  const form = useForm<SigninFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "", // Email or Phone
      password: "",
    },
  });
  const { mutate, isPending } = useLoginMutation();
  const { mutateAsync: verifyEmail } = useVerifyEmailMutation();

  const handleOnSubmit = (values: SigninFormData) => {
    mutate(values, {
      onSuccess: (data: any) => {
        if (data.token) {
            // Normal Login
            login(data);
            console.log(data);
            toast.success("Login successful");
            navigate("/dashboard");
        } else {
            // Verification Required (Backend sent 201)
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

  const handleVerifyOTP = async (otp: string): Promise<boolean> => {
    try {
      await verifyEmail({ identifier: identifier, otp });
      toast.success("Verified successfully! Please login.");
      setIsVerifying(false); // Return to login form to login (or auto-login if verify returns token?)
      // Backend verifyEmail does NOT return token, just 200 OK.
      // So user simply logs in again.
      // Or we can auto-login if we implemented that.
      // For now, return to form is safe.
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid code");
      return false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 ring-1 ring-white/10 flex items-center justify-center shadow-inner">
           <Layers className="size-6 text-[#00FFFF]" />
        </div>
        <span className="font-bold text-2xl hidden md:block text-white tracking-tighter">TaskHub</span>
      </div>
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center mb-5">
          <CardTitle className="text-2xl font-bold text-white">
            {isVerifying ? "Verify Account" : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-sm text-gray-400">
             {isVerifying 
              ? `Enter the code sent to ${identifier}` 
              : "Sign in to your account to continue"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isVerifying ? (
            <OTPVerification 
              onVerify={handleVerifyOTP}
              description="Check your email/phone for the 6-digit code."
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
                    <FormLabel>Email or Phone</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="email@example.com or +1234..."
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
                        className="text-sm text-blue-600"
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
