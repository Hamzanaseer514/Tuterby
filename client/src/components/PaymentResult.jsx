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
    if (success === "true" && paymentId) {   // 👈 condition add karo
      fetch(`${BASE_URL}/api/payment/confirm/${paymentId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => console.log("Payment confirmed:", data))
        .catch((err) => console.error(err));
    }
  }, [paymentId, success, token, isParentPayment]);
  

  return (
    <div className="p-10 text-center">
      {success === "true" ? (
        <h1 className="text-green-600 text-xl">✅ Payment Successful</h1>
      ) : (
        <h1 className="text-red-600 text-xl">❌ Payment Canceled</h1>
      )}
        <Link to={isParentPayment === "true" ? "/parent-dashboard" : "/student-dashboard"}>
          <Button>
            Go to Dashboard
          </Button>
        </Link>
    </div>
  );
}
