import React, { useState, useEffect } from "react";
import Mainlayout from "@/layout/Mainlayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Check, ShieldAlert, Sparkles, Star, Award, CreditCard } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

export default function Upgrade() {
  const { user, Logout } = useAuth();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingDetails, setBillingDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (user) {
      setBillingDetails((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);



  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      description: "Basic features for casual users",
      badgeColor: "bg-gray-100 text-gray-800 border-gray-300",
      features: [
        "Post 1 question per day",
        "Basic search functionality",
        "Standard community access",
      ],
      buttonText: "Current Plan",
      disabled: true,
      icon: Award,
    },
    {
      name: "Bronze",
      price: "₹99",
      period: "month",
      description: "Ideal for active learners",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
      features: [
        "Post 5 questions per day",
        "Bronze profile badge",
        "Advanced search filters (tags, min votes, date, unanswered)",
        "Standard community access",
      ],
      buttonText: "Upgrade to Bronze",
      disabled: false,
      popular: false,
      icon: Award,
    },
    {
      name: "Silver",
      price: "₹299",
      period: "month",
      description: "Great for professional developers",
      badgeColor: "bg-slate-100 text-slate-800 border-slate-300",
      features: [
        "Post 15 questions per day",
        "Silver profile badge",
        "Unlimited bookmarks (Saves tab)",
        "Enhanced profile visibility on Users list",
        "Priority email support",
      ],
      buttonText: "Upgrade to Silver",
      disabled: false,
      popular: true,
      icon: Sparkles,
    },
    {
      name: "Gold",
      price: "₹999",
      period: "month",
      description: "The ultimate power developer bundle",
      badgeColor: "bg-yellow-100 text-yellow-800 border-yellow-300",
      features: [
        "Unlimited question posting",
        "Gold profile badge",
        "Highest search priority (your posts sort first)",
        "Featured profile visibility on Users list",
        "Priority customer support",
        "Access to exclusive Gold Lounge space",
      ],
      buttonText: "Upgrade to Gold",
      disabled: false,
      popular: false,
      icon: Star,
    },
  ];

  const handleUpgrade = async (planName: string) => {
    if (!user) {
      toast.error("Please log in to upgrade your subscription!");
      router.push("/auth");
      return;
    }

    // Validate billing details
    if (!billingDetails.name || !billingDetails.email) {
      toast.error("Please provide a billing name and email address.");
      return;
    }

    setLoadingPlan(planName);

    try {
      // Razorpay order creation
      const res = await axiosInstance.post("/payment/razorpay-order", {
        planName,
        billingDetails,
      });

      // Load Razorpay overlay script dynamically (only once)
      const loadRazorpayScript = () => {
        return new Promise((resolve) => {
          if ((window as any).Razorpay) {
            resolve(true);
            return;
          }
          const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
          if (existing) {
            existing.addEventListener("load", () => resolve(true));
            return;
          }
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Failed to load Razorpay payment gateway.");
        return;
      }

      // Configure checkout modal options
      const prefillData: Record<string, string> = {
        name: billingDetails.name,
        email: billingDetails.email,
      };
      if (billingDetails.phone && billingDetails.phone.trim() !== "") {
        prefillData.contact = billingDetails.phone.trim();
      }

      const options = {
        key: res.data.keyId,
        amount: res.data.order.amount,
        currency: res.data.order.currency,
        name: "Code-Quest",
        description: `${planName} Plan`,
        order_id: res.data.order.id,
        handler: async function (response: any) {
          try {
            toast.info("Verifying transaction signature...");
            const verifyRes = await axiosInstance.post("/payment/razorpay-verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planName,
              billingDetails: res.data.billingDetails,
            });
            if (verifyRes.data.data) {
              toast.success("Subscription activated successfully!");
              const localUser = localStorage.getItem("user");
              if (localUser) {
                const parsed = JSON.parse(localUser);
                localStorage.setItem("user", JSON.stringify({ ...parsed, ...verifyRes.data.data }));
              }
              router.push(`/users/${user._id}?tab=billing`);
            }
          } catch (err: any) {
            console.error("Verification error:", err);
            toast.error(err.response?.data?.message || "Failed to verify signature.");
          }
        },
        prefill: prefillData,
        theme: {
          color: "#ef8236",
        },
        modal: {
          ondismiss: function () {
            console.log("Razorpay modal was closed by user");
            setLoadingPlan(null);
          },
          confirm_close: true,
          escape: true,
        },
      };

      console.log("Razorpay Checkout Initialization Options:", JSON.stringify({
        key: options.key,
        amount: options.amount,
        currency: options.currency,
        order_id: options.order_id,
        name: options.name,
        description: options.description,
        prefill: options.prefill,
      }, null, 2));

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.error("Razorpay payment.failed event:", response.error);
        toast.error(response.error?.description || "Payment failed");
      });
      rzp.open();
    } catch (error: any) {
      console.error("Upgrade error:", error);
      const msg = error.response?.data?.message || "Failed to initiate upgrade.";
      toast.error(msg);
      if (error.response?.status === 401) {
        Logout();
        router.push("/auth");
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <Mainlayout>
      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-orange-500 animate-pulse" /> Unlock Premium Platform Features
          </h1>
          <p className="text-lg text-gray-600">
            Choose the membership plan that fits your developer lifestyle. Post more questions, highlight your expertise, and gain advanced navigation tools.
          </p>
        </div>



        {/* Billing Details Panel */}
        <Card className="mb-12 border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
              <CreditCard className="w-5 h-5 text-blue-600" /> Billing Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="billingName">Billing Name *</Label>
                <Input
                  id="billingName"
                  value={billingDetails.name}
                  onChange={(e) => setBillingDetails({ ...billingDetails, name: e.target.value })}
                  placeholder="Full Name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="billingEmail">Billing Email *</Label>
                <Input
                  id="billingEmail"
                  type="email"
                  value={billingDetails.email}
                  onChange={(e) => setBillingDetails({ ...billingDetails, email: e.target.value })}
                  placeholder="name@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="billingPhone">Phone Number</Label>
                <Input
                  id="billingPhone"
                  value={billingDetails.phone}
                  onChange={(e) => setBillingDetails({ ...billingDetails, phone: e.target.value })}
                  placeholder="+91 99999 99999"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="billingAddress">Billing Address</Label>
                <Input
                  id="billingAddress"
                  value={billingDetails.address}
                  onChange={(e) => setBillingDetails({ ...billingDetails, address: e.target.value })}
                  placeholder="Street Address, City, State"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = mounted && (user?.plan === plan.name || (!user?.plan && plan.name === "Free"));
            
            return (
              <Card
                key={plan.name}
                className={`relative flex flex-col justify-between border transition-all duration-250 ${
                  plan.popular
                    ? "border-blue-500 shadow-md ring-2 ring-blue-100 scale-102"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                )}

                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-gray-900">{plan.name}</span>
                    <Icon className={`w-5 h-5 ${plan.name === "Gold" ? "text-yellow-500" : plan.name === "Silver" ? "text-slate-400" : plan.name === "Bronze" ? "text-amber-600" : "text-gray-400"}`} />
                  </div>
                  <div className="flex items-baseline gap-1 my-2">
                    <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-sm text-gray-500">/{plan.period}</span>
                  </div>
                  <p className="text-xs text-gray-500">{plan.description}</p>
                </CardHeader>

                <CardContent className="flex-1 pb-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <div className="p-6 pt-0 mt-auto">
                  <Button
                    onClick={() => handleUpgrade(plan.name)}
                    disabled={plan.disabled || isCurrent || loadingPlan !== null}
                    className={`w-full font-semibold transition ${
                      isCurrent
                        ? "bg-gray-100 text-gray-500 hover:bg-gray-100 border border-gray-200"
                        : plan.name === "Gold"
                        ? "bg-yellow-600 text-white hover:bg-yellow-700"
                        : plan.name === "Silver"
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : plan.name === "Bronze"
                        ? "bg-amber-600 text-white hover:bg-amber-700"
                        : "bg-gray-800 text-white hover:bg-gray-900"
                    }`}
                  >
                    {isCurrent ? "Active Plan" : loadingPlan === plan.name ? "Processing..." : plan.buttonText}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Mainlayout>
  );
}
