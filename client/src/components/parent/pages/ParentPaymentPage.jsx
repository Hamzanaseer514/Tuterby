import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useParent } from '../../../contexts/ParentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  BookOpen, 
  GraduationCap, 
  PoundSterling,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  DollarSign
} from 'lucide-react';
import { useToast } from '../../../components/ui/use-toast';

const ParentPaymentPage = () => {
  const { user } = useAuth();
  const { getParentStudentsPayments, createParentPaymentSession, loading } = useParent();
  const { toast } = useToast();
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(null);

  useEffect(() => {
    if (user?._id) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      setError(null);
      const response = await getParentStudentsPayments(user._id);
      if (response.success) {
        setPayments(response.payments || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Failed to fetch payment data');
    }
  };

  const handlePayment = async (payment) => {
    console.log("Processing payment for:", payment);
    try {
      setProcessingPayment(payment._id);
      
      // Prepare payment data for context function
      const paymentData = {
        ...payment,
        studentEmail: user.email // Add parent's email
      };

      // Use context function to create payment session
      const result = await createParentPaymentSession(paymentData);
      
      if (result.success) {
        console.log("Stripe checkout url:", result.checkoutUrl);
        // Redirect to Stripe Checkout
        window.location.href = result.checkoutUrl;
      }

    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process payment",
        variant: "destructive"
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentTypeIcon = (type) => {
    return type === 'monthly' ? <Calendar className="w-4 h-4" /> : <Clock className="w-4 h-4" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Error Loading Payments
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <Button onClick={fetchPayments} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Payment Records Found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Payment records will appear here once your children start booking tutoring sessions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payment History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track all payment activities for your children's tutoring sessions
          </p>
        </div>
        <Button onClick={fetchPayments} variant="outline" size="sm">
          <TrendingUp className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {payments.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(payments.reduce((sum, payment) => sum + (payment.base_amount || 0), 0))}
            </div>
          </CardContent>
        </Card>

        

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {payments.filter(p => p.payment_status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(
                payments.reduce((sum, payment) => 
                  sum + ((payment.monthly_amount * payment.discount_percentage / 100) || 0), 0
                )
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Payment Details */}
          <Card>
            <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
              </CardTitle>
              <CardDescription>
            Detailed view of all payment transactions and session bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment._id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getPaymentTypeIcon(payment.payment_type)}
                        </div>
                        <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {payment.student?.full_name || 'Student'}
                      </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                        {payment.subject?.name || 'Subject'} • {payment.academic_level?.level || 'Level'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          Tutor: {payment.tutor?.user_id?.full_name || 'Tutor Name'}
                        </span>
                      </div>
                    </div>
                </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(payment.monthly_amount || 0)}
                            </div>
                            {payment.discount_percentage > 0 && (
                      <div className="text-sm text-green-600 dark:text-green-400">
                        -{payment.discount_percentage}% discount
                              </div>
                            )}
                    {getStatusBadge(payment.payment_status)}
                              </div>
                </div>

                {/* Payment Amount Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Payment Type:</span>
                    <div className="font-medium capitalize">{payment.payment_type}</div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Base Amount:</span>
                    <div className="font-medium">{formatCurrency(payment.base_amount || 0)}</div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Discount:</span>
                    <div className="font-medium">
                      {payment.discount_percentage > 0 ? (
                        <span className="text-green-600 dark:text-green-400">
                          {payment.discount_percentage}%
                        </span>
                      ) : (
                        'No discount'
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Final Amount:</span>
                    <div className="font-medium text-lg font-semibold">
                      {formatCurrency(
                        payment.monthly_amount
                      )}
                        </div>
                      </div>
                        </div>

                {/* Session and Validity Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Sessions:</span>
                    <div className="font-medium">
                      {payment.sessions_remaining || 0} remaining
                      </div>
                        </div>
                  
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Valid Until:</span>
                    <div className="font-medium">
                      {payment.validity_end_date ? formatDate(payment.validity_end_date) : 'N/A'}
                    </div>
                    </div>

                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Request Date:</span>
                    <div className="font-medium">
                      {payment.request_date ? formatDate(payment.request_date) : 'N/A'}
                      </div>
                              </div>
                  
                              <div>
                    <span className="text-gray-500 dark:text-gray-400">Payment Method:</span>
                    <div className="font-medium capitalize">{payment.payment_method || 'N/A'}</div>
                              </div>
                            </div>

                                 {payment.request_notes && (
                   <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                     <span className="text-sm text-gray-500 dark:text-gray-400">Notes:</span>
                     <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                       {payment.request_notes}
                     </p>
                   </div>
                 )}

                 {/* Payment Action Button */}
                 <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                   <div className="flex items-center justify-between">
                     <div className="text-sm text-gray-500 dark:text-gray-400">
                       <span className="font-medium">Student:</span> {payment.student?.full_name || 'Child'}
                     </div>
                     {payment.payment_status === 'pending' && (
                       <Button
                         onClick={() => handlePayment(payment)}
                         disabled={processingPayment === payment._id}
                         className="bg-primary hover:bg-primary/90 text-white"
                         size="sm"
                       >
                         {processingPayment === payment._id ? (
                           <>
                             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                             Processing...
                           </>
                         ) : (
                           <>
                             <DollarSign className="w-4 h-4 mr-2" />
                             Pay Now
                           </>
                         )}
                       </Button>
                     )}
                     {payment.payment_status === 'paid' && (
                       <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                         <CheckCircle className="w-3 h-3 mr-1" />
                         Payment Complete
                       </Badge>
                     )}
                   </div>
                 </div>
                          </div>
                        ))}
                      </div>
                  </CardContent>
                </Card>
    </div>
  );
};

export default ParentPaymentPage;
