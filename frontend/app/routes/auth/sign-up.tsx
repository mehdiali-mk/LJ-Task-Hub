import { signUpSchema } from "@/lib/schema";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";
import { useSignUpMutation, useVerifyEmailMutation } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2, Layers } from "lucide-react";
import { OTPVerification } from "@/components/ui/otp-input";

export type SignupFormData = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [identifier, setIdentifier] = useState("");

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      phoneNumber: "",
      confirmPassword: "",
    },
  });

  const { mutate: register, isPending: isRegistering } = useSignUpMutation();
  const { mutateAsync: verifyEmail } = useVerifyEmailMutation();

  const handleOnSubmit = (values: SignupFormData) => {
    register(values, {
      onSuccess: () => {
        toast.success("Account created!", {
          description: "Please enter the code sent to your email or phone.",
        });
        setIdentifier(values.email || values.phoneNumber || "");
        setIsVerifying(true);
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
      toast.success("Verified successfully!");
      // Short delay to show success
      setTimeout(() => {
        navigate("/sign-in");
      }, 1000);
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
            {isVerifying ? "Verify Account" : "Create an account"}
          </CardTitle>
          <CardDescription className="text-sm text-gray-400">
            {isVerifying 
              ? `Enter the code sent to ${identifier}` 
              : "Create an account to continue"}
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
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address (Optional)</FormLabel>
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
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="********"
                              {...field}
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
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="********"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>

                <Button type="submit" className="w-full mt-2" disabled={isRegistering}>
                  {isRegistering ? "Signing up..." : "Sign up"}
                </Button>
              </form>
            </Form>
          )}

          {!isVerifying && (
            <CardFooter className="flex items-center justify-center mt-6 p-0">
                <p className="text-sm text-muted-foreground">
                  Already have an account? <Link to="/sign-in" className="text-white hover:underline">Sign in</Link>
                </p>
            </CardFooter>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
