// pages/PaymentResult.jsx
import React, { useEffect, useRef } from "react";
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
  const confirmedRef = useRef(false);
  const canceledRef = useRef(false);

  // Success: update DB via confirm API (same as webhook success)
  useEffect(() => {
    if (success !== "true" || !paymentId || confirmedRef.current) return;

    const confirmPaymentInDb = async () => {
      const token = getAuthToken();
      if (!token) return;
      try {
        const res = await fetch(`${BASE_URL}/api/payment/confirm/${paymentId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          confirmedRef.current = true;
        }
      } catch (err) {
        console.error("Confirm payment failed:", err);
      }
    };

    confirmPaymentInDb();
  }, [paymentId, success, getAuthToken]);

  // Cancel/Failed: update DB via cancel API (same as webhook payment_failed)
  useEffect(() => {
    if (success !== "false" || !paymentId || canceledRef.current) return;

    const cancelPaymentInDb = async () => {
      const token = getAuthToken();
      if (!token) return;
      try {
        const res = await fetch(`${BASE_URL}/api/payment/cancel/${paymentId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          canceledRef.current = true;
        }
      } catch (err) {
        console.error("Cancel payment failed:", err);
      }
    };

    cancelPaymentInDb();
  }, [paymentId, success, getAuthToken]);
  
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
