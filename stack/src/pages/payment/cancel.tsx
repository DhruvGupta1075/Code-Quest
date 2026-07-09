import React from "react";
import Mainlayout from "@/layout/Mainlayout";
import { useRouter } from "next/router";
import { XCircle, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancel() {
  const router = useRouter();

  return (
    <Mainlayout>
      <div className="max-w-md mx-auto my-12 p-6 bg-white border rounded-xl shadow-sm text-center">
        <div className="py-6 flex flex-col items-center gap-4">
          <XCircle className="w-16 h-16 text-red-500 animate-pulse" />
          <h2 className="text-2xl font-extrabold text-gray-900 mt-2">Payment Cancelled</h2>
          <p className="text-gray-600 text-sm">
            Your transaction was cancelled. No charges were made, and your account plan has not been changed.
          </p>

          <div className="w-full border-t border-gray-100 my-6 pt-6 flex flex-col gap-2">
            <Button
              onClick={() => router.push("/upgrade")}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Try Again / Change Plan
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
      </div>
    </Mainlayout>
  );
}
