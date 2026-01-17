import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowLeft, CheckCircle, Loader, XCircle, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVerifyEmailMutation } from "@/hooks/use-auth";
import { toast } from "sonner";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutate, isPending: isVerifying } = useVerifyEmailMutation();

  useEffect(() => {
    if (token) {
      mutate(
        { token },
        {
          onSuccess: () => {
            setIsSuccess(true);
          },
          onError: (error: any) => {
            const errorMessage =
              error.response?.data?.message || "An error occurred";
            setIsSuccess(false);
            console.log(error);

            toast.error(errorMessage);
          },
        }
      );
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
       <div className="flex flex-col items-center justify-center space-y-2 mb-8">
           <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 ring-1 ring-white/10 flex items-center justify-center shadow-inner mb-2">
             <Layers className="size-6 text-white/80" />
           </div>
          <h1 className="text-2xl font-bold text-white">TaskHub</h1>
       </div>

      <Card className="w-full max-w-md bg-white/[0.08] backdrop-blur-3xl border-white/20 ring-1 ring-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* <CardHeader>
          <Link to="/sign-in" className="flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign in
          </Link>
        </CardHeader> */}

        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 ">
            {isVerifying ? (
              <>
                <Loader className="w-10 h-10 text-white animate-spin" />
                <h3 className="text-lg font-semibold text-white mt-4">Verifying email...</h3>
                <p className="text-sm text-gray-400 text-center mt-2">
                  Please wait while we verify your email.
                </p>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="w-10 h-10 text-green-500" />
                <h3 className="text-lg font-semibold text-white mt-4">Email Verified</h3>
                <p className="text-sm text-gray-400 text-center mt-2">
                  Your email has been verified successfully.
                </p>
                <Link to="/sign-in" className="text-sm text-blue-500 mt-6">
                  <Button variant="outline">Back to Sign in</Button>
                </Link>
              </>
            ) : (
              <>
                <XCircle className="w-10 h-10 text-red-500" />
                <h3 className="text-lg font-semibold">
                  Email Verification Failed
                </h3>
                <p className="text-sm text-gray-500">
                  Your email verification failed. Please try again.
                </p>

                <Link to="/sign-in" className="text-sm text-blue-500 mt-6">
                  <Button variant="outline">Back to Sign in</Button>
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
