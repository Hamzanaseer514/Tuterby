// pages/PaymentResult.jsx
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { BASE_URL } from "@/config";
import { Link } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';

export default function PaymentResult() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const success = query.get("success");
  const paymentId = query.get("PI");
  const isParentPayment = query.get("isParentPayment");
  const { getAuthToken } = useAuth();
  const token = getAuthToken();
  
  useEffect(() => {
    // Payment confirmation is now handled by Stripe webhooks
    // No manual confirmation needed - webhook will update database automatically
    console.log("success", success);
    console.log("paymentId", paymentId);
    if (success === "true" && paymentId) {
      console.log("✅ Payment successful - webhook will handle confirmation");
    }
  }, [paymentId, success, isParentPayment]);
  

  return (
    <div className="p-10 text-center">
      {success === "true" ? (
        <h1 className="text-green-600 text-xl mb-4">✅ Payment Successful</h1>
      ) : (
        <h1 className="text-red-600 text-xl mb-4">❌ Payment Canceled</h1>
      )}
        <Link to={isParentPayment === "true" ? "/parent-dashboard" : "/student-dashboard"}>
          <Button>
            Go to Dashboard
          </Button>
        </Link>
    </div>
  );
}
