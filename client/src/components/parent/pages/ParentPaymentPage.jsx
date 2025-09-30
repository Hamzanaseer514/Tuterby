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
  DollarSign,
  Shield,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  RefreshCw
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
      // console.error('Error fetching payments:', error);
      setError('Failed to fetch payment data');
    }
  };

  const handlePayment = async (payment) => {
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
        // Redirect to Stripe Checkout
        window.location.href = result.checkoutUrl;
      }

    } catch (error) {
      // console.error("Error processing payment:", error);
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
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 text-xs"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  const getValidityStatusBadge = (validityStatus) => {
    let config;
    let icon;

    if (validityStatus === 'expired') {
      config = { color: 'bg-red-100 text-red-800' };
      icon = <ShieldX className="h-3 w-3 mr-1" />;
    } else if (validityStatus === 'active') {
      config = { color: 'bg-blue-100 text-blue-800' };
      icon = <ShieldCheck className="h-3 w-3 mr-1" />;
    } else {
      config = { color: 'bg-gray-100 text-gray-800' };
      icon = <Shield className="h-3 w-3 mr-1" />;
    }

    return (
      <Badge className={`${config.color} text-xs`}>
        {icon}
        {validityStatus ? validityStatus.charAt(0).toUpperCase() + validityStatus.slice(1) : 'Unknown'}
      </Badge>
    );
  };

  const getOverallStatusBadge = (overallStatus) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: <ShieldCheck className="h-3 w-3 mr-1" /> },
      paid: { color: 'bg-green-100 text-green-800', icon: <ShieldCheck className="h-3 w-3 mr-1" /> },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3 mr-1" /> },
      failed: { color: 'bg-red-100 text-red-800', icon: <ShieldX className="h-3 w-3 mr-1" /> },
      expired: { color: 'bg-red-100 text-red-800', icon: <ShieldX className="h-3 w-3 mr-1" /> },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: <AlertTriangle className="h-3 w-3 mr-1" /> }
    };

    const config = statusConfig[overallStatus] || statusConfig.pending;
    return (
      <Badge className={`${config.color} text-xs`}>
        {config.icon}
        {overallStatus ? overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1) : 'Unknown'}
      </Badge>
    );
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

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">
          No Payment Records Found
        </h3>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Payment records will appear here once your children start booking tutoring sessions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-4">
      {/* Header */}
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">
            Payment History
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Track all payment activities for your children's tutoring sessions
          </p>
        </div>
        <Button 
          onClick={fetchPayments} 
          variant="outline" 
          size="sm"
          className="w-full xs:w-auto text-xs sm:text-sm"
        >
          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-2 xs:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              {payments.length}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(payments.reduce((sum, payment) => sum + (payment.base_amount || 0), 0))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              {payments.filter(p => p.payment_status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Savings
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(
                Math.round(payments.reduce((sum, payment) =>
                  sum + ((payment.monthly_amount * payment.discount_percentage / 100) || 0), 0
                ) * 100) / 100
              )}
            </div>
          </CardContent>
        </Card>

      
      </div>

      {/* Payment Details */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
            Payment Details
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Detailed view of all payment transactions and session bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-3 sm:space-y-4">
            {payments.map((payment) => (
              <div
                key={payment._id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
              >
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      {getPaymentTypeIcon(payment.payment_type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                        {payment.student?.full_name || 'Student'}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {payment.subject?.name || 'Subject'} • {payment.academic_level?.level || 'Level'}
                      </p>
                      <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                          <span className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">
                            Tutor: {payment.tutor?.user_id?.full_name || 'Tutor Name'}
                          </span>
                        </div>
                        {payment.is_renewal && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs w-fit">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Renewal
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2 min-w-0">
                    <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(payment.monthly_amount || 0)}
                    </div>
                    {payment.discount_percentage > 0 && (
                      <div className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                        -{payment.discount_percentage}% discount
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {getStatusBadge(payment.payment_status)}
                      {payment.overall_status && (
                        <div className="text-xs">
                          {getOverallStatusBadge(payment.overall_status)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Amount Details */}
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">Payment Type:</span>
                    <div className="font-medium text-sm capitalize">{payment.payment_type}</div>
                  </div>

                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">Base Amount:</span>
                    <div className="font-medium text-sm">{formatCurrency(payment.base_amount || 0)}</div>
                  </div>

                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">Discount:</span>
                    <div className="font-medium text-sm">
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
                    <span className="text-gray-500 dark:text-gray-400 text-xs">Final Amount:</span>
                    <div className="font-semibold text-base sm:text-lg">
                      {formatCurrency(payment.monthly_amount)}
                    </div>
                  </div>
                </div>

                {/* Session and Validity Details */}
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">Sessions:</span>
                    <div className="font-medium text-sm">
                      {payment.sessions_remaining || 0} remaining
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">Valid Until:</span>
                    <div className="font-medium text-sm">
                      {payment.validity_end_date ? formatDate(payment.validity_end_date) : 'N/A'}
                    </div>
                    {payment.validity_end_date && (
                      <div className="text-xs text-gray-400">
                        {Math.max(0, Math.ceil((new Date(payment.validity_end_date) - new Date()) / (1000 * 60 * 60 * 24)))} days left
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">Request Date:</span>
                    <div className="font-medium text-sm">
                      {payment.request_date ? formatDate(payment.request_date) : 'N/A'}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">Payment Method:</span>
                    <div className="font-medium text-sm capitalize">{payment.payment_method || 'N/A'}</div>
                  </div>
                </div>

                {/* Validity Status Information */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Validity Status:</span>
                      <div className="mt-1">
                        {getValidityStatusBadge(payment.validity_status)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Is Valid:</span>
                      <div className="font-medium text-sm">
                        {payment.validity_status == "active" ? (
                          <span className="text-green-600 dark:text-green-400">Yes</span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400">No</span>
                        )}
                      </div>
                    </div>
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
                  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Student:</span> {payment.student?.full_name || 'Child'}
                    </div>
                    <div className="flex gap-2">
                      {payment.payment_status === 'pending' && (
                        <Button
                          onClick={() => handlePayment(payment)}
                          disabled={processingPayment === payment._id}
                          className="bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm w-full xs:w-auto"
                          size="sm"
                        >
                          {processingPayment === payment._id ? (
                            <>
                              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Pay Now
                            </>
                          )}
                        </Button>
                      )}
                      
                      {payment.payment_status === 'paid' && payment.validity_status === 'expired' && !payment.has_renewal && (
                        <Button
                          onClick={() => handlePayment(payment)}
                          disabled={processingPayment === payment._id}
                          className="bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm w-full xs:w-auto"
                          size="sm"
                        >
                          {processingPayment === payment._id ? (
                            <>
                              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Renew
                            </>
                          )}
                        </Button>
                      )}

                      {payment.payment_status === 'paid' && payment.validity_status === 'expired' && payment.has_renewal && (
                        <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Payment Renewed
                        </Badge>
                      )}

                      {payment.validity_status === 'active' && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Payment Complete
                        </Badge>
                      )}
                    </div>
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