import React, { useState, useEffect } from 'react';
import {
    Close,
    CheckCircleOutline,
    AccessTime,
    ErrorOutline,
    // Payment,
    Tag,
    Discount,
    MoneyOff,
    CreditCard,
    EventAvailable,
    Subject,
    // School,
    DateRange,
    // Person
    Email,
    Event,
    Create
} from '@mui/icons-material';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    TextField,
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    IconButton,
    Tooltip,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Divider,
    Avatar,
    useTheme
} from '@mui/material';
import {
    Search,
    Download,
    Visibility,
    Payment,
    AccountBalance,
    TrendingUp,
    AttachMoney,
    Refresh,
    Person,
    School,
    CalendarToday,
    Receipt,
    FilterList
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { BASE_URL } from "../../config";
import { getAuthToken } from '../../services/adminService';
import AdminLayout from '../../components/admin/components/AdminLayout';

// Styled components
const DashboardHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    background: 'linear-gradient(45deg, #4a6fa5 30%, #6c8ec6 90%)',
    padding: theme.spacing(3),
    borderRadius: theme.spacing(1.5),
    color: 'white'
}));

// Fixed StatsCard component - using inline styles for gradient
const StatsCard = ({ children, gradient }) => {
    return (
        <Card sx={{
            height: '100%',
            borderRadius: 1.5,
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
            background: gradient,
            color: 'white',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)'
            }
        }}>
            {children}
        </Card>
    );
};

const PaymentTableContainer = styled(Paper)(({ theme }) => ({
    borderRadius: theme.spacing(1.5),
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    '& .MuiTableHead-root': {
        background: 'linear-gradient(45deg, #f5f7fa 0%, #e4e8f0 100%)'
    }
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
    let color;
    switch (status) {
        case 'paid':
            color = '#4caf50';
            break;
        case 'pending':
            color = '#ff9800';
            break;
        case 'failed':
            color = '#f44336';
            break;
        case 'expired':
            color = '#f44336';
            break;
        case 'active':
            color = '#2196f3';
            break;
        default:
            color = theme.palette.grey[500];
    }
    return {
        backgroundColor: color,
        color: 'white',
        fontWeight: 'bold',
        fontSize: '0.75rem',
        padding: theme.spacing(0.5)
    };
});

const DetailRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.grey[50],
    marginBottom: theme.spacing(1)
}));

// Card colors for stats - predefined gradients
const cardGradients = [
    'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', // Green for revenue
    'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)', // Blue for completed
    'linear-gradient(135deg, #ff9800 0%, #ffa726 100%)', // Orange for pending
    'linear-gradient(135deg, #9c27b0 0%, #ab47bc 100%)'  // Purple for total
];

// Main component
const TutorPayments = () => {
    const theme = useTheme();
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    // Fetch payments data from API
    const fetchPayments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = getAuthToken();
            const response = await fetch(`${BASE_URL}/api/admin/tutor-payments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setPayments(data.payments);
                setFilteredPayments(data.payments);
            } else {
                throw new Error(data.message || 'Failed to fetch payments');
            }
        } catch (err) {
            console.error('Error fetching payments:', err);
            setError(err.message);
            setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    // Apply filters
    // Apply filters
    useEffect(() => {
        let results = payments;

        // 🔍 Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            results = results.filter(payment =>
                payment.student_name?.toLowerCase().includes(term) ||
                payment.tutor_name?.toLowerCase().includes(term) ||
                payment.subject?.toLowerCase().includes(term) ||
                payment.academic_level?.toLowerCase().includes(term) ||  // ✅ Added
                payment.payment_id?.toLowerCase().includes(term)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            results = results.filter(payment => payment.payment_status === statusFilter || payment.validity_status === statusFilter);
        }

        // Type filter
        if (typeFilter !== 'all') {
            results = results.filter(payment => payment.payment_type === typeFilter);
        }

        setFilteredPayments(results);
    }, [searchTerm, statusFilter, typeFilter, payments]);


    // Calculate stats
    const totalRevenue = filteredPayments
        .filter(p => p.payment_status === 'paid')
        .reduce((sum, payment) => sum + (payment.final_amount || 0), 0);

    const pendingPayments = filteredPayments
        .filter(p => p.payment_status === 'pending').length;

    const completedPayments = filteredPayments
        .filter(p => p.payment_status === 'paid').length;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
        setDetailModalOpen(true);
    };

    const handleCloseModal = () => {
        setDetailModalOpen(false);
        setSelectedPayment(null);
    };

    return (
        <AdminLayout tabValue="payments">
            <Box p={3}>
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}

                >
                    <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
                <DashboardHeader
                    sx={{
                        background: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)", // purple → blue
                        // background: "gradient-text", // purple → blue
                        color: "white", // make all text/icons readable
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 3,
                        borderRadius: 2,
                    }}
                >
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Payment Management
                        </Typography>
                        <Typography variant="subtitle1">
                            Manage and monitor all tutor payments in one place
                        </Typography>
                    </Box>
                    <Box>
                        <Tooltip title="Refresh data">
                            <IconButton color="inherit" onClick={fetchPayments} sx={{ mr: 1 }}>
                                <Refresh />
                            </IconButton>
                        </Tooltip>

                    </Box>
                </DashboardHeader>


                {/* Stats Cards - Fixed with proper gradient prop */}
                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard gradient={cardGradients[0]}>
                            <CardContent>
                                <Box display="flex" alignItems="flex-start">
                                    <AttachMoney sx={{ fontSize: 40, opacity: 0.8, mr: 2 }} />
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                                            {formatCurrency(totalRevenue)}
                                        </Typography>
                                        <Typography variant="body2">
                                            Total Revenue
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </StatsCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard gradient={cardGradients[1]}>
                            <CardContent>
                                <Box display="flex" alignItems="flex-start">
                                    <AccountBalance sx={{ fontSize: 40, opacity: 0.8, mr: 2 }} />
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                                            {completedPayments}
                                        </Typography>
                                        <Typography variant="body2">
                                            Completed Payments
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </StatsCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard gradient={cardGradients[2]}>
                            <CardContent>
                                <Box display="flex" alignItems="flex-start">
                                    <Payment sx={{ fontSize: 40, opacity: 0.8, mr: 2 }} />
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                                            {pendingPayments}
                                        </Typography>
                                        <Typography variant="body2">
                                            Pending Payments
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </StatsCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard gradient={cardGradients[3]}>
                            <CardContent>
                                <Box display="flex" alignItems="flex-start">
                                    <TrendingUp sx={{ fontSize: 40, opacity: 0.8, mr: 2 }} />
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                                            {filteredPayments.length}
                                        </Typography>
                                        <Typography variant="body2">
                                            Total Transactions
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </StatsCard>
                    </Grid>
                </Grid>
                {/* Filters */}
                <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                    <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                        <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <FilterList sx={{ mr: 1 }} /> Filters
                        </Typography>
                        <TextField
                            placeholder="Search payments..."
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ minWidth: 450 }}
                        />

                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="all">All Statuses</MenuItem>
                                <MenuItem value="paid">Paid</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="failed">Failed</MenuItem>
                                <MenuItem value="expired">Expired</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Payment Type</InputLabel>
                            <Select
                                value={typeFilter}
                                label="Payment Type"
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <MenuItem value="all">All Types</MenuItem>
                                <MenuItem value="monthly">Monthly</MenuItem>
                                <MenuItem value="one-time">One-time</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Paper>

                {/* Loading state */}
                {isLoading && (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                        <CircularProgress size={60} />
                    </Box>
                )}

                {/* Error state
                {error && !isLoading && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        Error loading payments: {error}.
                        <Box component="span" sx={{ ml: 1, cursor: 'pointer', textDecoration: 'underline' }} onClick={fetchPayments}>
                            Try again
                        </Box>
                    </Alert>
                )} */}

                {/* Payments Table */}
                {!isLoading && (
                    <PaymentTableContainer>
                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Payment ID</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Student</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Tutor</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Subject & Level</TableCell>
                                        {/* <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Amount</TableCell> */}
                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Validity Status</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Payment Status</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredPayments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center">
                                                <Box py={3}>
                                                    <Typography variant="body1" color="textSecondary">
                                                        {payments.length === 0
                                                            ? 'No payments found in the system'
                                                            : 'No payments found matching your criteria'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPayments.map((payment) => (
                                            <TableRow key={payment.payment_id} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="medium" color="primary">
                                                        #{payment.payment_id}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center">
                                                        {/* <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: theme.palette.secondary.main }}>
                              <Person fontSize="small" />
                            </Avatar> */}
                                                        <Box>
                                                            <Box display="flex" alignItems="center" gap={1}>
                                                            <Typography variant="body2" fontWeight="medium">
                                                                {payment.student_name || 'N/A'}
                                                            </Typography>
                                                                {payment.is_renewal && (
                                                                    <Chip
                                                                        size="small"
                                                                        label="Renewal"
                                                                        color="warning"
                                                                        variant="outlined"
                                                                        sx={{ fontSize: '0.7rem', height: 20 }}
                                                                    />
                                                                )}
                                                            </Box>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {payment.student_email || 'N/A'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center">
                                                        {/* <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: theme.palette.info.main }}>
                              <School fontSize="small" />
                            </Avatar> */}
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="medium">
                                                                {payment.tutor_name || 'N/A'}
                                                            </Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {payment.tutor_email || 'N/A'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {payment.subject || 'N/A'}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {payment.academic_level || 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                {/* <TableCell>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="bold" color="primary">
                                                            {formatCurrency(payment.final_amount)}
                                                        </Typography>
                                                        {payment.discount > 0 && (
                                                            <Typography variant="caption" color="success.main">
                                                                {payment.discount}% off
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </TableCell> */}
                                                <TableCell>
                                                    <StatusChip
                                                        size="small"
                                                        label={payment.validity_status}
                                                        status={payment.validity_status}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <StatusChip
                                                        size="small"
                                                        label={payment.payment_status}
                                                        status={payment.payment_status}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip title="View Details">
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => handleViewDetails(payment)}
                                                        >
                                                            <Visibility />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </PaymentTableContainer>
                )}

                {/* Payment Detail Modal */}
                <Dialog
                    open={detailModalOpen}
                    onClose={handleCloseModal}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 3,
                            boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                            overflow: 'hidden'
                        }
                    }}
                >
                    <DialogTitle sx={{
                        background: 'linear-gradient(135deg, #4a6fa5 0%, #6c8ec6 50%, #4a6fa5 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        py: 2,
                        px: 3,
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '1px',
                            background: 'rgba(255,255,255,0.2)'
                        }
                    }}>
                        <Box className='flex justify-between items-center'>

                            {/* Title in Center */}
                            <Box className='flex items-center gap-3'>
                                <Typography variant="h6" component="div" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                                    <Receipt sx={{ mr: 1.5, fontSize: '1.8rem' }} />
                                    Payment Details
                                </Typography>
                                {/* Status Chip on Left */}
                                {selectedPayment && (
                                    <Box>
                                        <Chip className='text-sm'
                                            icon={selectedPayment.validity_status === 'active' ?
                                                <CheckCircleOutline /> :
                                                selectedPayment.validity_status === 'expired' ?
                                                    <AccessTime /> : selectedPayment.validity_status === 'expired' ?
                                                        <ErrorOutline /> : <ErrorOutline />}
                                            label={selectedPayment.validity_status.toUpperCase()}
                                            color={
                                                selectedPayment.validity_status === 'active' ? 'success' :
                                                    selectedPayment.validity_status === 'expired' ? 'error' : 'warning'
                                            }
                                            variant="filled"
                                            sx={{
                                                fontSize: '0.7rem',
                                                py: 1.5,
                                                px: 2,
                                                borderRadius: 4,
                                                fontWeight: 600,
                                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                    </Box>
                                )}

                            </Box>

                            {/* Empty box to balance flex layout */}
                            <Box sx={{ width: '100px' }}></Box>
                        </Box>

                        <IconButton
                            aria-label="close"
                            onClick={handleCloseModal}
                            sx={{
                                position: 'absolute',
                                right: 16,
                                top: 16,
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.1)'
                                }
                            }}
                        >
                            <Close />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{ p: 3, bgcolor: '#f9fafb' }}>
                        {selectedPayment && (
                            <Box>

                                {/*renewed  Payment Information */}
                                <Grid item xs={12} sm={12} className='mt-4'>
                                    <Box
                                        sx={{
                                            p: 2.5,
                                            width: '100%',        // ensure full width
                                            backgroundColor: 'white',
                                            borderRadius: 2,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                            border: '1px solid',
                                            borderColor: 'grey.100',
                                        }}
                                    >
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <Payment sx={{ mr: 1, color: 'primary.main', fontSize: '1.5rem' }} />
                                            <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                                Renewal Payment Information
                                            </Typography>

                                        </Box>
                                        <DetailRow icon={<Refresh />}>
                                            <Typography variant="body2" color="text.secondary">Renewal Status:</Typography>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {selectedPayment.is_renewal ? (
                                                    <Chip
                                                        size="small"
                                                        label="Renewal Payment"
                                                        color="warning"
                                                        variant="outlined"
                                                        sx={{ fontSize: '0.7rem', height: 20 }}
                                                    />
                                                ) : (
                                                    <Chip
                                                        size="small"
                                                        label="Original Payment"
                                                        color="primary"
                                                        variant="outlined"
                                                        sx={{ fontSize: '0.7rem', height: 20 }}
                                                    />
                                                )}
                                            </Box>
                                        </DetailRow>
                                        {selectedPayment.original_payment_id && (
                                            <DetailRow icon={<Create />}>
                                                <Typography variant="body2" color="text.secondary">Original Payment ID:</Typography>
                                                <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ fontFamily: 'monospace' }}>
                                                    #{selectedPayment.original_payment_id}
                                                </Typography>
                                            </DetailRow>
                                        )}
                                    </Box>
                                </Grid>

                                <Grid spacing={3} className="mt-4">

                                    {/* Payment Information */}
                                    <Grid item xs={12} sm={6} >
                                        <Box sx={{
                                            p: 2.5,
                                            backgroundColor: 'white',
                                            borderRadius: 2,
                                            height: '100%',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                            border: '1px solid',
                                            borderColor: 'grey.100'
                                        }}>
                                            <Box display="flex" alignItems="center" mb={2}>
                                                <Payment sx={{ mr: 1, color: 'primary.main', fontSize: '1.5rem' }} />
                                                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                                    Payment Information
                                                </Typography>

                                            </Box>

                                            <DetailRow icon={<Tag />}>
                                                <Typography variant="body2" color="text.secondary">Payment ID:</Typography>
                                                <Box className='ml-5'></Box>
                                                <Typography variant="body2" fontWeight="bold" color="text.primary">
                                                    #{selectedPayment.payment_id}
                                                </Typography>
                                            </DetailRow>
                                            <DetailRow icon={<AttachMoney />}>
                                                <Typography variant="body2" color="text.secondary">Amount:</Typography>
                                                <Typography variant="body2" fontWeight="bold" color="primary.main">
                                                    {formatCurrency(selectedPayment.final_amount)}
                                                </Typography>
                                            </DetailRow>
                                            {selectedPayment.discount > 0 && (
                                                <DetailRow icon={<Discount />}>
                                                    <Typography variant="body2" color="text.secondary">Discount:</Typography>
                                                    <Typography variant="body2" fontWeight="bold" color="success.main">
                                                        {selectedPayment.discount}%
                                                    </Typography>
                                                </DetailRow>
                                            )}
                                            <DetailRow icon={<MoneyOff />}>
                                                <Typography variant="body2" color="text.secondary">Base Amount:</Typography>
                                                <Typography variant="body2" fontWeight="bold" color="text.primary">
                                                    {formatCurrency(selectedPayment.base_amount)}
                                                </Typography>
                                            </DetailRow>
                                            <DetailRow icon={<CreditCard />}>
                                                <Typography variant="body2" color="text.secondary">Payment Type:</Typography>
                                                <Typography variant="body2" fontWeight="bold" textTransform="capitalize" color="text.primary">
                                                    {selectedPayment.payment_type}
                                                </Typography>
                                            </DetailRow>
                                            <DetailRow icon={<Payment />}>
                                                <Typography variant="body2" color="text.secondary">Payment Method:</Typography>
                                                <Typography variant="body2" fontWeight="bold" textTransform="capitalize" color="text.primary">
                                                    {selectedPayment.payment_method?.replace('_', ' ') || 'N/A'}
                                                </Typography>
                                            </DetailRow>

                                        </Box>
                                    </Grid>

                                    {/* Session Details */}
                                    <Grid item xs={12} sm={6} className='mt-4'>
                                        <Box sx={{
                                            p: 2.5,
                                            backgroundColor: 'white',
                                            borderRadius: 2,
                                            height: '100%',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                            border: '1px solid',
                                            borderColor: 'grey.100'
                                        }}>
                                            <Box display="flex" alignItems="center" mb={2}>
                                                <EventAvailable sx={{ mr: 1, color: 'secondary.main', fontSize: '1.5rem' }} />
                                                <Typography variant="subtitle1" fontWeight="bold" color="secondary.main">
                                                    Session Details
                                                </Typography>
                                            </Box>
                                            <DetailRow icon={<Subject />}>
                                                <Typography variant="body2" color="text.secondary">Subject:</Typography>
                                                <Typography variant="body2" fontWeight="bold" color="text.primary">
                                                    {selectedPayment.subject || 'N/A'}
                                                </Typography>
                                            </DetailRow>
                                            <DetailRow icon={<School />}>
                                                <Typography variant="body2" color="text.secondary">Academic Level:</Typography>
                                                <Typography variant="body2" fontWeight="bold" color="text.primary">
                                                    {selectedPayment.academic_level || 'N/A'}
                                                </Typography>
                                            </DetailRow>
                                            <DetailRow icon={<EventAvailable />}>
                                                <Typography variant="body2" color="text.secondary">Sessions Remaining:</Typography>
                                                <Typography variant="body2" fontWeight="bold" color="text.primary">
                                                    {selectedPayment.sessions_remaining}
                                                </Typography>
                                            </DetailRow>
                                            <DetailRow icon={<DateRange />}>
                                                <Typography variant="body2" color="text.secondary">Validity Period:</Typography>
                                                <Box textAlign="right" className='ml-5'>
                                                    <Typography variant="body2" fontWeight="bold" color="text.primary">
                                                        {formatDate(selectedPayment.validity_start_date)}                                                         to {formatDate(selectedPayment.validity_end_date)}

                                                    </Typography>
                                                </Box>
                                            </DetailRow>
                                            <DetailRow icon={<Event />}>
                                                <Typography variant="body2" color="text.secondary">Payment Date:</Typography>
                                                <Typography variant="body2" fontWeight="bold" color="text.primary">
                                                    {formatDate(selectedPayment.payment_date)}
                                                </Typography>
                                            </DetailRow>
                                        </Box>
                                    </Grid>

                                    <Grid className=' flex gap-6 justify-center items-center mt-4'>

                                    {/* Student Information with Avatar */}
                                    <Grid  item xs={12} sm={6}>
                                        <Box sx={{
                                            p: 2.5,
                                            backgroundColor: 'white',
                                            borderRadius: 2,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                            border: '1px solid',
                                            borderColor: 'primary.100',
                                            background: 'linear-gradient(to bottom right, #f0f7ff, white)'
                                        }}>
                                            <Box display="flex" alignItems="center" mb={2}>
                                                <Avatar
                                                    src={`${BASE_URL}${selectedPayment.stphoto_url}`}
                                                    alt={selectedPayment.full_name}
                                                    sx={{ width: 50, height: 50, mr: { xs: 0, sm: 2 }, mb: { xs: 2, sm: 0 } }}
                                                />
                                                {/* {selectedPayment.student_name ? selectedPayment.student_name.charAt(0).toUpperCase() : 'S'} */}
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                                                        Student Information
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <DetailRow icon={<Person />}>
                                                <Typography variant="body2" color="text.secondary">Name:</Typography>
                                                <Typography variant="body2" fontWeight="bold" color="text.primary">
                                                    {selectedPayment.student_name || 'N/A'}
                                                </Typography>
                                            </DetailRow>
                                            <DetailRow icon={<Email />}>
                                                <Typography variant="body2" color="text.secondary">Email:</Typography>
                                                <Box className='ml-5'></Box>
                                                <Typography variant="body2" fontWeight="bold" color="text.primary">
                                                    {selectedPayment.student_email || 'N/A'}
                                                </Typography>
                                            </DetailRow>
                                        </Box>
                                    </Grid>

                                    {/* Tutor Information with Avatar */}
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{
                                            p: 2.5,
                                            backgroundColor: 'white',
                                            borderRadius: 2,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                            border: '1px solid',
                                            borderColor: 'secondary.100',
                                            background: 'linear-gradient(to bottom right, #f5fef5, white)'
                                        }}>
                                            <Box display="flex" alignItems="center" mb={2}>
                                                <Avatar
                                                    src={`${BASE_URL}${selectedPayment.tphoto_url}`}
                                                    alt={selectedPayment.tutor_name}
                                                    sx={{ width: 50, height: 50, mr: { xs: 0, sm: 2 }, mb: { xs: 2, sm: 0 } }}
                                                />
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight="bold" color="secondary.main">
                                                        Tutor Information
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <DetailRow icon={<Person />}>
                                                <Typography variant="body2" color="text.secondary">Name:</Typography>
                                                <Typography variant="body2" fontWeight="bold" color="text.primary">
                                                    {selectedPayment.tutor_name || 'N/A'}
                                                </Typography>
                                            </DetailRow>
                                            <DetailRow icon={<Email />}>
                                                <Typography variant="body2" color="text.secondary">Email:</Typography>
                                                <Box className='ml-5'></Box>
                                                <Typography variant="body2" fontWeight="bold" color="text.primary">
                                                    {selectedPayment.tutor_email || 'N/A'}
                                                </Typography>
                                            </DetailRow>
                                        </Box>
                                    </Grid>
                                    </Grid>

                                </Grid>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 2, px: 3, bgcolor: '#f9fafb', borderTop: '1px solid', borderColor: 'grey.200' }}>
                        <Button
                            onClick={handleCloseModal}
                            color="primary"
                            variant="contained"
                            startIcon={<Close />}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
                                '&:hover': {
                                    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                                }
                            }}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>

            </Box>
        </AdminLayout>
    );
};

export default TutorPayments;