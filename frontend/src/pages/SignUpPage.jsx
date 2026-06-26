import { useState } from "react";
import { MessagesSquare, KeyRound } from "lucide-react";
import { Link } from "react-router";
import toast from "react-hot-toast";

import useSignUp from "../hooks/useSignUp";

const SignUpPage = () => {
  const [step, setStep] = useState(1);
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    gender: "boy",
  });
  const [otp, setOtp] = useState("");

  const {
    isPending,
    error,
    signupMutation,
    verifyOtpMutation,
    isVerifying,
    verificationError
  } = useSignUp();

  const handleSignup = (e) => {
    e.preventDefault();
    signupMutation(signupData, {
      onSuccess: () => {
        toast.success("OTP sent to your email!");
        setStep(2);
      }
    });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    verifyOtpMutation({ email: signupData.email, otp });
  };

  return (
    <div
      className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="cupcake"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/* FORM SIDE */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col justify-center">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <MessagesSquare className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Konnect
            </span>
          </div>

          {/* ERROR MESSAGES */}
          {error && step === 1 && (
            <div className="alert alert-error mb-4">
              <span>{error.response?.data?.message || "An error occurred"}</span>
            </div>
          )}
          {verificationError && step === 2 && (
            <div className="alert alert-error mb-4">
              <span>{verificationError.response?.data?.message || "Invalid OTP"}</span>
            </div>
          )}

          <div className="w-full">
            {step === 1 ? (
              <form onSubmit={handleSignup}>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold">Create an Account</h2>
                    <p className="text-sm opacity-70">
                      Join Konnect and start chatting!
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Full Name</span>
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="input input-bordered w-full"
                        value={signupData.fullName}
                        onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Email</span>
                      </label>
                      <input
                        type="email"
                        placeholder="john@gmail.com"
                        className="input input-bordered w-full"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Password</span>
                      </label>
                      <input
                        type="password"
                        placeholder="********"
                        className="input input-bordered w-full"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        required
                      />
                      <p className="text-xs opacity-70 mt-1">
                        Password must be at least 6 characters long
                      </p>
                    </div>

                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Gender</span>
                      </label>
                      <div className="flex gap-4">
                        <label className="label cursor-pointer flex gap-2">
                          <input type="radio" name="gender" value="boy" className="radio radio-primary" checked={signupData.gender === "boy"} onChange={(e) => setSignupData({ ...signupData, gender: e.target.value })} />
                          <span className="label-text">Male</span>
                        </label>
                        <label className="label cursor-pointer flex gap-2">
                          <input type="radio" name="gender" value="girl" className="radio radio-primary" checked={signupData.gender === "girl"} onChange={(e) => setSignupData({ ...signupData, gender: e.target.value })} />
                          <span className="label-text">Female</span>
                        </label>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-2">
                        <input type="checkbox" className="checkbox checkbox-sm" required />
                        <span className="text-xs leading-tight">
                          I agree to the{" "}
                          <span className="text-primary hover:underline">terms of service</span> and{" "}
                          <span className="text-primary hover:underline">privacy policy</span>
                        </span>
                      </label>
                    </div>
                  </div>

                  <button className="btn btn-primary w-full" type="submit" disabled={isPending}>
                    {isPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Loading...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>

                  <div className="text-center mt-4">
                    <p className="text-sm">
                      Already have an account?{" "}
                      <Link to="/login" className="text-primary hover:underline">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                      <KeyRound className="size-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Verify Your Email</h2>
                      <p className="text-sm opacity-70">
                        We sent a 6-digit code to {signupData.email}
                      </p>
                    </div>
                  </div>

                  <div className="form-control w-full pt-4">
                    <label className="label">
                      <span className="label-text">Enter OTP Code</span>
                    </label>
                    <input
                      type="text"
                      placeholder="123456"
                      className="input input-bordered w-full text-center text-lg tracking-[0.25em]"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>

                  <button className="btn btn-primary w-full mt-2" type="submit" disabled={isVerifying || otp.length < 6}>
                    {isVerifying ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Verifying...
                      </>
                    ) : (
                      "Verify Account"
                    )}
                  </button>

                  <div className="text-center mt-4 pt-2">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-xs"
                      onClick={() => setStep(1)}
                    >
                      Wait, let me change my email
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ILLUSTRATION SIDE */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            <div className="relative aspect-square max-w-sm mx-auto">
              <img src="/i.png" alt="Language connection illustration" className="w-full h-full" />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">Connect with your friends worldwide</h2>
              <p className="opacity-70">
                Experience seamless and beautiful chatting experience
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
