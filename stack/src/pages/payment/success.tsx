import React, { useEffect, useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import { useRouter } from "next/router";
import axiosInstance from "@/lib/axiosinstance";
import { CheckCircle2, Loader2, Sparkles, Home, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

export default function PaymentSuccess() {
  const router = useRouter();
  const { session_id, plan, mock, billing } = router.query;
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    const verify = async () => {
      if (!session_id) {
        setVerifying(false);
        setErrorMessage("Missing payment session ID.");
        return;
      }

      try {
        const res = await axiosInstance.get("/payment/verify-session", {
          params: { session_id, plan, mock, billing },
        });

        if (res.data.data) {
          // Update local storage user profile while retaining current JWT token
          const stored = localStorage.getItem("user");
          if (stored) {
            const parsed = JSON.parse(stored);
            const updatedUser = { ...parsed, ...res.data.data };
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }
          setSuccess(true);
          toast.success("Payment verified! Subscription active.");
        } else {
          setErrorMessage("Failed to verify transaction. Please contact support.");
        }
      } catch (error: any) {
        console.error("Verification error:", error);
        setErrorMessage(error.response?.data?.message || "An error occurred during verification.");
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [router.isReady, session_id, plan, mock, billing]);

  return (
    <Mainlayout>
      <div className="max-w-md mx-auto my-12 p-6 bg-white border rounded-xl shadow-sm text-center">
        {verifying ? (
          <div className="py-8 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <h2 className="text-xl font-bold text-gray-800">Verifying Payment</h2>
            <p className="text-gray-500 text-sm">
              We are connecting with Stripe to verify your transaction and activate your premium developer tools...
            </p>
          </div>
        ) : success ? (
          <div className="py-6 flex flex-col items-center gap-4">
            <div className="relative">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
              <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mt-2">Subscription Activated!</h2>
            <p className="text-gray-600 text-sm">
              Congratulations! Your account has been upgraded to the <span className="font-bold text-orange-600">{plan} Plan</span>.
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Confirmation email and invoice PDF have been successfully generated and sent to your email.
            </p>

            <div className="w-full border-t border-gray-100 my-6 pt-6 flex flex-col gap-2">
              <Button
                onClick={() => {
                  const stored = localStorage.getItem("user");
                  if (stored) {
                    const parsed = JSON.parse(stored);
                    window.location.href = `/users/${parsed._id}?tab=billing`;
                  } else {
                    router.push("/");
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" /> Go to Billing Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" /> Home Feed
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <span className="text-2xl font-bold">!</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Verification Failed</h2>
            <p className="text-red-600 text-sm">{errorMessage}</p>
            <p className="text-gray-500 text-xs">
              If amount was debited, please contact stackoverflow clone billing support.
            </p>
            <Button onClick={() => router.push("/upgrade")} className="bg-orange-600 hover:bg-orange-700 text-white w-full mt-4">
              Return to Pricing Plans
            </Button>
          </div>
        )}
      </div>
    </Mainlayout>
  );
}
