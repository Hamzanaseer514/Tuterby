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
  RefreshCw
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
    start_date: '',
    end_date: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

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
      console.error('Error fetching payment history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchPaymentHistory();
    }
  }, [user, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleSearch = () => {
    // Filter payments based on search term
    return payments.filter(payment =>
      payment.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.academic_level.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredPayments = searchTerm ? handleSearch() : payments;

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  //   if (error) {
  //     return (
  //       <div className="text-center py-8">
  //         <p className="text-red-600 mb-4">{error}</p>
  //         <Button onClick={fetchPaymentHistory} variant="outline">
  //           <RefreshCw className="h-4 w-4 mr-2" />
  //           Try Again
  //         </Button>
  //       </div>
  //     );
  //   }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600">Track your earnings and payment details</p>
        </div>
        <Button onClick={fetchPaymentHistory} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
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
            <CardTitle className="text-sm font-medium">Hourly Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.hourlyEarnings || 0)}</div>
            <p className="text-xs text-muted-foreground">
              From hourly bookings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
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
            Showing {filteredPayments.length} of {pagination.totalPayments} payments
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
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{payment.student_name}</div>
                          <div className="text-sm text-gray-500">{payment.student_email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{payment.subject}</td>
                      <td className="py-3 px-4 text-gray-900">{payment.academic_level}</td>
                      <td className="py-3 px-4">
                        {getPaymentTypeBadge(payment.payment_type)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(payment.base_amount, payment.currency)}
                        </div>
                        {payment.discount_percentage > 0 && (
                          <div className="text-sm text-green-600">
                            {payment.discount_percentage}% discount
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(payment.payment_status)}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {formatDate(payment.payment_date)}
                      </td>
                      <td className="py-3 px-4">
                        {payment.payment_type === 'monthly' ? (
                          <div className="text-sm">
                            <div>{payment.sessions_remaining} remaining</div>
                            <div className="text-gray-500">
                              of {payment.total_sessions_per_month}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">N/A</div>
                        )}
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
    </div>
  );
};

export default TutorPaymentHistory;
