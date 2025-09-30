import { BASE_URL, STRIPE_PUBLISHABLE_KEY } from '../../config';
import { loadStripe } from "@stripe/stripe-js";
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../components/ui/use-toast';
import {
    ArrowLeft,
    CreditCard,
    Clock,
    CheckCircle,
    XCircle,
    DollarSign,
    Calendar,
    User,
    BookOpen,
    Filter,
    Search,
    ChevronDown,
    ChevronUp,
    Download,
    Eye,
    RefreshCw
} from 'lucide-react';
import { Avatar } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const StudentPaymentPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { getAuthToken, user, fetchWithAuth } = useAuth();

    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [expandedPayment, setExpandedPayment] = useState(null);

    useEffect(() => {
        if (user?._id) {
            fetchPayments();
        }
    }, [user]);

    useEffect(() => {
        filterAndSortPayments();
    }, [payments, searchQuery, statusFilter, sortBy]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();

            const response = await fetchWithAuth(`${BASE_URL}/api/auth/student/payments/${user._id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            },token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
            );

            if (!response.ok) {
                throw new Error('Failed to fetch payments');
            }

            const data = await response.json();
            setPayments(data.payments || []);
        } catch (error) {
            console.error('Error fetching payments:', error);
            // toast({
            //     title: "Error",
            //     description: "Failed to load payment data",
            //     variant: "destructive"
            // });
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortPayments = () => {
        let filtered = [...payments];

        // Apply status filter
        if (statusFilter !== 'all') {
            if (statusFilter === 'expired') {
                filtered = filtered.filter(payment => payment.status === 'completed' && payment.validity_status === 'expired');
            } else if (statusFilter === 'completed') {
                filtered = filtered.filter(payment => payment.status === 'completed' && payment.validity_status !== 'expired');
            } else {
                filtered = filtered.filter(payment => payment.status === statusFilter);
            }
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(payment =>
                payment.tutor_name?.toLowerCase().includes(query) ||
                payment.subject?.toLowerCase().includes(query) ||
                payment.academic_level?.toLowerCase().includes(query)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'amount':
                    return b.amount - a.amount;
                case 'tutor_name':
                    return (a.tutor_name || '').localeCompare(b.tutor_name || '');
                case 'status':
                    return (a.status || '').localeCompare(b.status || '');
                default:
                    return 0;
            }
        });

        setFilteredPayments(filtered);
    };

    const handlePayment = async (payment) => {
        try {
            setLoading(true);
            const token = getAuthToken();

            // If it's an expired payment, create renewal first
            if (payment.status === 'completed' && payment.validity_status === 'expired') {
                const renewalResponse = await fetchWithAuth(`${BASE_URL}/api/auth/student/payments/${payment._id}/renew`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        validity_start_date: new Date().toISOString(),
                        validity_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
                    })
                }, token, (newToken) => localStorage.setItem("authToken", newToken));

                if (!renewalResponse.ok) throw new Error("Failed to create renewal payment");

                const renewalData = await renewalResponse.json();
                payment._id = renewalData.payment._id; // Use new payment ID
            }

            const response = await fetchWithAuth(`${BASE_URL}/api/payment/create-checkout-session`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    amount: payment.monthly_amount,
                    paymentId: payment._id,
                    tutorName: payment.tutor_name,
                    subject: payment.subject,
                    academicLevel: payment.academic_level,
                    studentEmail: user.email,
                    payment_type: payment.payment_type,
                    total_sessions_per_month: payment.total_sessions_per_month,
                    base_amount: payment.base_amount,
                    discount_percentage: payment.discount_percentage,
                    days_remaining: payment.days_remaining,
                })
            }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
            );
    
            if (!response.ok) throw new Error("Failed to create checkout session");
    
            // ✅ parse backend response
            const data = await response.json();
    
    
            // 🚀 instant redirect to Stripe Checkout
            window.location.href = data.url;
    
        } catch (error) {
            console.error("Error processing payment:", error);
            toast({
                title: "Error",
                description: "Failed to process payment",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };
    


    const getStatusBadge = (status, validityStatus) => {
        const statusConfig = {
            'pending': { variant: 'secondary', text: 'Pending Payment', icon: Clock, color: 'text-amber-600 bg-amber-100' },
            'completed': { 
                variant: 'default', 
                text: validityStatus === 'expired' ? 'Payment Expired' : 'Academic Level Paid', 
                icon: validityStatus === 'expired' ? XCircle : CheckCircle, 
                color: validityStatus === 'expired' ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100' 
            },
            'cancelled': { variant: 'outline', text: 'Cancelled', icon: XCircle, color: 'text-gray-600 bg-gray-100' },
            'failed': { variant: 'outline', text: 'Payment Failed', icon: XCircle, color: 'text-red-600 bg-red-100' }
        };

        const config = statusConfig[status] || { variant: 'outline', text: status, icon: Clock, color: 'text-gray-600 bg-gray-100' };
        const IconComponent = config.icon;

        return (
            <Badge variant={config.variant} className={`flex items-center gap-1 ${config.color} border-0`}>
                <IconComponent className="w-3 h-3" />
                {config.text}
            </Badge>
        );
    };

    const getStatusCounts = () => {
        const counts = {
            all: payments.length,
            pending: payments.filter(p => p.status === 'pending').length,
            completed: payments.filter(p => p.status === 'completed' && p.validity_status !== 'expired').length,
            expired: payments.filter(p => p.status === 'completed' && p.validity_status === 'expired').length,
            failed: payments.filter(p => p.status === 'failed').length,
            cancelled: payments.filter(p => p.status === 'cancelled').length
        };
        return counts;
    };

    const statusCounts = getStatusCounts();

    const toggleExpandPayment = (paymentId) => {
        if (expandedPayment === paymentId) {
            setExpandedPayment(null);
        } else {
            setExpandedPayment(paymentId);
        }
    };

    if (loading && payments.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
                        <p className="text-gray-600 mt-1">Manage your tutor payments and requests</p>
                    </div>
                    <Button onClick={fetchPayments} variant="outline" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-800">{statusCounts.all}</div>
                            <div className="text-sm text-blue-600">Total Payments</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-amber-800">{statusCounts.pending}</div>
                            <div className="text-sm text-amber-600">Pending</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-800">{statusCounts.completed}</div>
                            <div className="text-sm text-green-600">Active</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-800">{statusCounts.expired}</div>
                            <div className="text-sm text-red-600">Expired</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-gray-800">{statusCounts.cancelled}</div>
                            <div className="text-sm text-gray-600">Cancelled</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card className="mb-6 border-0 shadow-md">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search by tutor name, subject, or academic level..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-48">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status ({statusCounts.all})</SelectItem>
                                    <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
                                    <SelectItem value="completed">Active ({statusCounts.completed})</SelectItem>
                                    <SelectItem value="expired">Expired ({statusCounts.expired})</SelectItem>
                                    <SelectItem value="failed">Failed ({statusCounts.failed})</SelectItem>
                                    <SelectItem value="cancelled">Cancelled ({statusCounts.cancelled})</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date">Sort by Date</SelectItem>
                                    <SelectItem value="amount">Sort by Amount</SelectItem>
                                    <SelectItem value="tutor_name">Sort by Tutor Name</SelectItem>
                                    <SelectItem value="status">Sort by Status</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Payments List */}
                <div className="space-y-4">
                    {filteredPayments.length === 0 ? (
                        <Card className="text-center py-12 border-dashed">
                            <CardContent>
                                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                                <p className="text-gray-600 mb-4">
                                    {searchQuery || statusFilter !== 'all'
                                        ? 'Try adjusting your filters or search criteria'
                                        : 'You haven\'t made any tutor requests yet'
                                    }
                                </p>
                                {searchQuery || statusFilter !== 'all' ? (
                                    <Button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>
                                        Clear Filters
                                    </Button>
                                ) : (
                                    <Button onClick={() => navigate('/student/tutor-search')}>
                                        Find Tutors
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        filteredPayments.map((payment) => (
                            <Card key={payment._id} className="overflow-hidden transition-all hover:shadow-lg">
                                <CardContent className="p-0">
                                    <div className="p-6 cursor-pointer" onClick={() => toggleExpandPayment(payment._id)}>
                                        <div className="flex items-start justify-between">
                                            {console.log("payment", payment)}
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                                {payment.tutor_photo_url ? (
              <img
                src={`${BASE_URL}${payment.tutor_photo_url}`}
                alt={payment.tutor_name || "Student"}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0"
              />
            ) : (
              <Avatar className="h-10 w-10 flex-shrink-0">
                <div className="h-full w-full bg-blue-100 flex items-center justify-center rounded-full">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
              </Avatar>
            )}                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex flex-col md:flex-row md:items-start justify-between mb-3 gap-4">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900">
                                                                {payment.tutor_name || 'Unknown Tutor'}
                                                            </h3>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    <BookOpen className="w-3 h-3 mr-1" />
                                                    {payment.subject || 'Unknown Subject'}
                                                </Badge>
                                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                                    {payment.academic_level || 'Unknown Level'}
                                                </Badge>
                                                {payment.is_renewal && (
                                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                                        <RefreshCw className="w-3 h-3 mr-1" />
                                                        Renewal
                                                    </Badge>
                                                )}
                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-end gap-2">
                                                            <div className="text-right">
                                                                {payment.discount_percentage > 0 && (
                                                                    <div className="text-sm text-gray-500 line-through">
                                                                        £{(payment.base_amount) * (payment.total_sessions_per_month)}
                                                                    </div>
                                                                )}
                                                                <p className="text-2xl font-bold text-gray-900">
                                                                    £{payment.monthly_amount || 0}
                                                                </p>
                                                                {payment.discount_percentage > 0 && (
                                                                    <div className="text-xs text-green-600 font-medium">
                                                                        {payment.discount_percentage}% OFF
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {getStatusBadge(payment.status, payment.validity_status)}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            Requested: {new Date(payment.created_at).toLocaleDateString()}
                                                        </div>
                                                        {payment.payment_date && (
                                                            <div className="flex items-center gap-1">
                                                                <DollarSign className="w-4 h-4" />
                                                                Paid: {new Date(payment.payment_date).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expandable Details */}
                                    {expandedPayment === payment._id && (
                                        <div className="px-6 pb-6 border-t pt-4 animate-in fade-in">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Hourly Rate: £{payment.base_amount || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Package: {payment.payment_type === 'monthly' ? 'Monthly' : 'Hourly'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4" />
                                                    <span>Sessions: {payment.sessions_remaining || 0}/{payment.total_sessions_per_month || 0}</span>
                                                </div>
                                                {payment.days_remaining !== undefined && (
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4" />
                                                        <span>Valid for: {payment.days_remaining} days</span>
                                                    </div>
                                                )}
                                                {payment.monthly_amount && (
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4" />
                                                        <span>Monthly: £{payment.monthly_amount}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {payment.notes && (
                                                <div className="mb-4">
                                                    <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                                                        {payment.notes}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                {payment.status === 'pending' && (
                                                    <Button
                                                        onClick={() => handlePayment(payment)}
                                                        disabled={loading}
                                                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700"
                                                    >
                                                        <CreditCard className="w-4 h-4" />
                                                        Pay Now
                                                    </Button>
                                                )}

                                                {payment.status === 'completed' && payment.validity_status === 'active' && payment.academic_level_paid && (
                                                    <Button variant="outline" disabled className="bg-green-50 text-green-700 border-green-200">
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Academic Level Access Granted
                                                    </Button>
                                                )}

                                                {payment.status === 'completed' && payment.validity_status === 'expired' && !payment.has_renewal && (
                                                    <Button
                                                        onClick={() => handlePayment(payment)}
                                                        disabled={loading}
                                                        className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700"
                                                    >
                                                        <CreditCard className="w-4 h-4" />
                                                        Renew Payment
                                                    </Button>
                                                )}

                                                {payment.status === 'completed' && payment.validity_status === 'expired' && payment.has_renewal && (
                                                    <Button variant="outline" disabled className="bg-gray-50 text-gray-700 border-gray-200">
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Payment Renewed
                                                    </Button>
                                                )}

                                                {payment.status === 'failed' && (
                                                    <Button
                                                        onClick={() => handlePayment(payment)}
                                                        variant="outline"
                                                        disabled={loading}
                                                        className="border-red-200 text-red-700 hover:bg-red-50"
                                                    >
                                                        <CreditCard className="w-4 h-4 mr-2" />
                                                        Retry Payment
                                                    </Button>
                                                )}

                                                {/* <Button variant="outline" size="sm">
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Receipt
                                                </Button> */}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-center border-t bg-gray-50 py-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleExpandPayment(payment._id)}
                                            className="text-xs text-gray-500"
                                        >
                                            {expandedPayment === payment._id ? (
                                                <>
                                                    <ChevronUp className="w-4 h-4 mr-1" />
                                                    Show Less
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="w-4 h-4 mr-1" />
                                                    Show Details
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentPaymentPage;