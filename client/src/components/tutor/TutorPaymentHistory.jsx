import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw,
  Shield,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  CreditCard,
  XCircle
} from 'lucide-react';

const TutorPaymentHistory = () => {
  const { user, getAuthToken, fetchWithAuth } = useAuth();
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({});
  const [monthlyBreakdown, setMonthlyBreakdown] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = getAuthToken();
  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    payment_type: '',
    validity_status: '',
    date: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = {
        'Content-Type': 'application/json',
      };

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetchWithAuth(
        `${BASE_URL}/api/tutor/payment-history/${user._id}?${queryParams}`,
        { method: 'GET', headers }, token, (newToken) => localStorage.setItem("authToken", newToken)
      );

      if (!response.ok) {
        throw new Error('Failed to fetch payment history');
      }

      const data = await response.json();

      if (data.success) {
        setPayments(data.data.payments);
        setSummary(data.data.summary);
        setMonthlyBreakdown(data.data.monthlyBreakdown);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.message || 'Failed to fetch payment history');
      }
    } catch (err) {
      setError(err.message);
      // console.error('Error fetching payment history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchPaymentHistory();
    }
  }, [user, filters.page, filters.limit]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Only reset page for server-side filters (page, limit)
      ...(key === 'page' || key === 'limit' ? {} : { page: 1 })
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handlePaymentClick = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      status: '',
      payment_type: '',
      validity_status: '',
      date: ''
    });
    setSearchTerm('');
  };

  const applyLocalFilters = () => {
    let filtered = [...payments];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.academic_level.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(payment => payment.payment_status === filters.status);
    }

    // Apply payment type filter
    if (filters.payment_type) {
      filtered = filtered.filter(payment => payment.payment_type === filters.payment_type);
    }

    // Apply validity status filter
    if (filters.validity_status) {
      filtered = filtered.filter(payment => payment.validity_status === filters.validity_status);
    }

    // Apply date filter
    if (filters.date) {
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.payment_date);
        const filterDate = new Date(filters.date);
        return paymentDate.toDateString() === filterDate.toDateString();
      });
    }

    return filtered;
  };

  const filteredPayments = applyLocalFilters();

  // Count active filters (excluding search term as it's handled separately)
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) =>
    key !== 'page' && key !== 'limit' && value && value !== ''
  ).length + (searchTerm ? 1 : 0);

  const formatCurrency = (amount, currency = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { variant: 'default', color: 'bg-green-100 text-green-800' },
      pending: { variant: 'secondary', color: 'bg-yellow-100 text-yellow-800' },
      failed: { variant: 'destructive', color: 'bg-red-100 text-red-800' },
      cancelled: { variant: 'outline', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={config.color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentTypeBadge = (type) => {
    const typeConfig = {
      monthly: { color: 'bg-blue-100 text-blue-800' },
      hourly: { color: 'bg-purple-100 text-purple-800' }
    };

    const config = typeConfig[type] || typeConfig.hourly;
    return (
      <Badge className={config.color}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getValidityStatusBadge = (validityStatus) => {
    let config;
    let icon;

    if (validityStatus === 'expired') {
      config = { color: 'bg-red-100 text-red-800' };
      icon = <ShieldX className="h-3 w-3 mr-1" />;
    } else if (validityStatus === 'active') {
      config = { color: 'bg-green-100 text-green-800' };
      icon = <ShieldCheck className="h-3 w-3 mr-1" />;
    } else {
      config = { color: 'bg-gray-100 text-gray-800' };
      icon = <Shield className="h-3 w-3 mr-1" />;
    }

    return (
      <Badge className={config.color}>
        {icon}
        {validityStatus.charAt(0).toUpperCase() + validityStatus.slice(1)}
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
      <Badge className={config.color}>
        {config.icon}
        {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600">Track your earnings and payment details</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={clearFilters} variant="outline" size="sm">
            <XCircle className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
          <Button onClick={fetchPaymentHistory} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalEarnings || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.totalSessions || 0} total sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per Session</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.averageEarnings || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Per completed session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Packages</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.monthlyEarnings || 0)}</div>
            <p className="text-xs text-muted-foreground">
              From monthly subscriptions
            </p>
          </CardContent>
        </Card>



        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Payments</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.activePayments || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summary.totalSessionsRemaining || 0} sessions remaining
            </p>
          </CardContent>
        </Card>


      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <Button onClick={clearFilters} variant="outline" size="sm">
              <XCircle className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Payment Type</label>
              <Select
                value={filters.payment_type}
                onValueChange={(value) => handleFilterChange('payment_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Validity Status</label>
              <Select
                value={filters.validity_status}
                onValueChange={(value) => handleFilterChange('validity_status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All validity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
              />
            </div>


          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            Showing {filteredPayments.length} of {payments.length} payments
            {activeFiltersCount > 0 && (
              <span className="text-blue-600 ml-2">
                ({activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No payments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Subject</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Level</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Payment Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Validity Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handlePaymentClick(payment)}
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{payment.student_name}</div>
                          {payment.is_renewal && (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 mt-1">
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Renewal
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{payment.subject}</td>
                      <td className="py-3 px-4 text-gray-900">{payment.academic_level}</td>
                      <td className="py-3 px-4">
                        {getPaymentTypeBadge(payment.payment_type)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(payment.payment_status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(payment.base_amount, payment.currency)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getValidityStatusBadge(payment.validity_status)}
                      </td>

                      <td className="py-3 px-4 text-gray-900">
                        {formatDate(payment.validity_start_date)}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Detail Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">Payment Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Payment Overview */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-900 mb-3">Payment Overview</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                  <div>
                    <label className="text-sm font-medium text-blue-700">Amount</label>
                    <p className="text-lg font-semibold text-blue-900">
                      {formatCurrency(selectedPayment.base_amount, selectedPayment.currency)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-700">Payment Type</label>
                    <div className="mt-1">
                      {getPaymentTypeBadge(selectedPayment.payment_type)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Student Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Student Name</label>
                    <p className="text-sm text-gray-900">{selectedPayment.student_name}</p>
                  </div>
                  {/* <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedPayment.student_email}</p>
                  </div> */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Subject</label>
                    <p className="text-sm text-gray-900">{selectedPayment.subject}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Academic Level</label>
                    <p className="text-sm text-gray-900">{selectedPayment.academic_level}</p>
                  </div>
                </div>
              </div>

              {/* Payment Status Information */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-lg font-semibold text-green-900 mb-3">Status Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-green-700">Payment Status</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedPayment.payment_status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-green-700">Validity Status</label>
                    <div className="mt-1">
                      {getValidityStatusBadge(selectedPayment.validity_status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-green-700">Overall Status</label>
                    <div className="mt-1">
                      {getOverallStatusBadge(selectedPayment.validity_status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Payment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Base Amount</label>
                    <p className="text-sm text-gray-900">
                      {formatCurrency(selectedPayment.base_amount, selectedPayment.currency)}
                    </p>
                  </div>
                  {selectedPayment.discount_percentage > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Discount</label>
                      <p className="text-sm text-green-600">
                        {selectedPayment.discount_percentage}%
                      </p>
                    </div>
                  )}
                  {selectedPayment.monthly_amount && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Monthly Amount</label>
                      <p className="text-sm text-gray-900">
                        {formatCurrency(selectedPayment.monthly_amount, selectedPayment.currency)}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Payment Method</label>
                    <p className="text-sm text-gray-900 capitalize">
                      {selectedPayment.payment_method?.replace('_', ' ') || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Currency</label>
                    <p className="text-sm text-gray-900">{selectedPayment.currency}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Is Active</label>
                    <p className="text-sm text-gray-900">
                      {selectedPayment.validity_status === 'active' ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Renewal Status</label>
                    <div className="mt-1">
                      {selectedPayment.is_renewal ? (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Renewal Payment
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Original Payment
                        </Badge>
                      )}
                    </div>
                  </div>
                  {selectedPayment.original_payment_id && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Original Payment ID</label>
                      <p className="text-sm text-gray-900 font-mono">
                        {selectedPayment.original_payment_id}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Session Information */}
              {selectedPayment.payment_type === 'monthly' && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="text-lg font-semibold text-purple-900 mb-3">Session Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-purple-700">Sessions Remaining</label>
                      <p className="text-lg font-semibold text-purple-900">
                        {selectedPayment.sessions_remaining}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-purple-700">Total Sessions</label>
                      <p className="text-sm text-purple-900">
                        {selectedPayment.total_sessions_per_month}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-purple-700">Sessions Used</label>
                      <p className="text-sm text-purple-900">
                        {(selectedPayment.total_sessions_per_month || 0) - (selectedPayment.sessions_remaining || 0)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-purple-700">Usage Percentage</label>
                      <p className="text-sm text-purple-900">
                        {selectedPayment.total_sessions_per_month > 0
                          ? Math.round(((selectedPayment.total_sessions_per_month - selectedPayment.sessions_remaining) / selectedPayment.total_sessions_per_month) * 100)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Validity Information */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="text-lg font-semibold text-yellow-900 mb-3">Validity Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-yellow-700">Validity Start Date</label>
                    <p className="text-sm text-yellow-900">
                      {formatDate(selectedPayment.validity_start_date)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-yellow-700">Validity End Date</label>
                    <p className="text-sm text-yellow-900">
                      {formatDate(selectedPayment.validity_end_date)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-yellow-700">Days Remaining</label>
                    <p className="text-sm text-yellow-900">
                      {selectedPayment.validity_end_date
                        ? Math.max(0, Math.ceil((new Date(selectedPayment.validity_end_date) - new Date()) / (1000 * 60 * 60 * 24)))
                        : 'N/A'
                      } days
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Timeline</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Request Date</label>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedPayment.request_date)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Payment Date</label>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedPayment.validity_start_date)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorPaymentHistory;
