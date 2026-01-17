import { postData } from "@/lib/fetch-util";
import type { SignupFormData } from "@/routes/auth/sign-up";
import { useMutation } from "@tanstack/react-query";

export const useSignUpMutation = () => {
  return useMutation({
    mutationFn: (data: SignupFormData) => postData("/auth/register", data),
  });
};

export const useVerifyEmailMutation = () => {
  return useMutation({
    mutationFn: (data: { identifier: string; otp: string }) =>
      postData("/auth/verify-email", data),
  });
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (data: { identifier: string; password: string }) =>
      postData("/auth/login", data),
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      postData("/auth/reset-password-request", data),
  });
};

export const useSendVerificationMutation = () => {
  return useMutation({
    mutationFn: (data: { channel: "email" | "phone" }) =>
      postData("/auth/send-verification", data),
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: {
      token: string;
      newPassword: string;
      confirmPassword: string;
    }) => postData("/auth/reset-password", data),
  });
};

export const useEnable2FAMutation = () => {
  return useMutation({
    mutationFn: () => postData("/auth/enable-2fa", {}),
  });
};

export const useDisable2FAMutation = () => {
  return useMutation({
    mutationFn: () => postData("/auth/disable-2fa", {}),
  });
};

export const useVerify2FAMutation = () => {
  return useMutation({
    mutationFn: (data: { userId: string; otp: string }) =>
      postData("/auth/verify-2fa", data),
  });
};
