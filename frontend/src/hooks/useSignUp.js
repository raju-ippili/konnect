import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup, verifyOtp } from "../lib/api";

const useSignUp = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
  });

  const {
    mutate: verifyOtpMutate,
    isPending: isVerifying,
    error: verificationError,
  } = useMutation({
    mutationFn: verifyOtp,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  });

  return {
    isPending,
    error,
    signupMutation: mutate,
    verifyOtpMutation: verifyOtpMutate,
    isVerifying,
    verificationError,
  };
};
export default useSignUp;
