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
    User,
} from 'lucide-react';
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
    Alert,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Divider,
    CircularProgress,
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
    Edit,
    Delete,
    CalendarToday,
    Receipt,
    FilterList
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { BASE_URL } from "../../config";
import { getAuthToken, getAllTutorPayments, deleteTutorPayment, updateTutorPayment } from '../../services/adminService';
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
    const [isLoading, setIsLoading] = useState(true); // Start with true to show loading
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    // Edit/Delete states
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        payment_status: '',
        validity_status: '',
        base_amount: '',
        sessions_remaining: ''
    });
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [linkWarningOpen, setLinkWarningOpen] = useState(false);
    const [linkWarningData, setLinkWarningData] = useState(null);
    // Delete confirmation modal state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteTargetPayment, setDeleteTargetPayment] = useState(null);
    const [isDeletingPayment, setIsDeletingPayment] = useState(false);

    // Fetch payments data from API
    const fetchPayments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getAllTutorPayments();

            if (response.success) {
                setPayments(response.payments);
                setFilteredPayments(response.payments);
            } else {
                throw new Error(response.message || 'Failed to fetch payments');
            }
        } catch (err) {
            //console.error('Error fetching payments:', err);
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

    // Open edit dialog and populate form
    const handleOpenEdit = (payment) => {
        setSelectedPayment(payment);
        setEditForm({
            payment_status: payment.payment_status || '',
            validity_status: payment.validity_status || '',
            base_amount: payment.base_amount ?? payment.final_amount ?? '',
            sessions_remaining: payment.sessions_remaining ?? ''
        });
        setEditModalOpen(true);
    };

    const handleCloseEdit = () => {
        setEditModalOpen(false);
        setEditForm({ payment_status: '', validity_status: '', base_amount: '', sessions_remaining: '' });
        setIsSavingEdit(false);
        setSelectedPayment(null);
    };

    const handleEditChange = (field) => (e) => {
        setEditForm({ ...editForm, [field]: e.target.value });
    };

    const handleSaveEdit = async () => {
        if (!selectedPayment) return;
        setIsSavingEdit(true);
        try {
            const payload = {};
            if (editForm.payment_status) payload.payment_status = editForm.payment_status;
            if (editForm.validity_status) payload.validity_status = editForm.validity_status;
            if (editForm.base_amount !== '') payload.base_amount = Number(editForm.base_amount);
            if (editForm.sessions_remaining !== '') payload.sessions_remaining = Number(editForm.sessions_remaining);

            await updateTutorPayment(selectedPayment.payment_id, payload);
            setSnackbar({ open: true, message: 'Payment updated successfully', severity: 'success' });
            fetchPayments();
            handleCloseEdit();
        } catch (err) {
            // If API returned structured links, show a warning dialog
            if (err && err.data && err.data.links) {
                setLinkWarningData(err.data.links);
                setLinkWarningOpen(true);
            } else {
                setSnackbar({ open: true, message: `Update failed: ${err.message || err}`, severity: 'error' });
            }
        } finally {
            setIsSavingEdit(false);
        }
    };

    // Open confirmation dialog for delete
    const handleDeletePayment = async (payment) => {
        setDeleteTargetPayment(payment);
        setDeleteConfirmOpen(true);
    };

    // Perform deletion after user confirms
    const performDeletePayment = async () => {
        if (!deleteTargetPayment) return;
        setIsDeletingPayment(true);
        try {
            await deleteTutorPayment(deleteTargetPayment.payment_id);
            setSnackbar({ open: true, message: 'Payment deleted successfully', severity: 'success' });
            // Refresh
            fetchPayments();
            setDeleteConfirmOpen(false);
            setDeleteTargetPayment(null);
        } catch (err) {
            if (err && err.data && err.data.links) {
                setLinkWarningData(err.data.links);
                setLinkWarningOpen(true);
            } else {
                setSnackbar({ open: true, message: `Delete failed: ${err.message || err}`, severity: 'error' });
            }
        } finally {
            setIsDeletingPayment(false);
        }
    };

    return (
        // <AdminLayout tabValue="payments">
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

            {/* Stats Cards - Responsive Flex Layout */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    flexWrap: 'wrap',
                    gap: { xs: 2, sm: 3 },
                    mb: 4,
                    width: '100%'
                }}
            >
                {/* Total Revenue Card */}
                <Box
                    sx={{
                        flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' },
                        minWidth: { xs: '100%', sm: 'auto' }
                    }}
                >
                    <StatsCard gradient={cardGradients[0]}>
                        <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                            <Box
                                display="flex"
                                alignItems="flex-start"
                                flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
                                gap={{ xs: 1.5, sm: 2 }}
                            >
                                <AttachMoney
                                    sx={{
                                        fontSize: { xs: 32, sm: 36, md: 40 },
                                        opacity: 0.8,
                                        mr: { xs: 0, sm: 2 },
                                        flexShrink: 0
                                    }}
                                />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        variant="h5"
                                        fontWeight="bold"
                                        gutterBottom
                                        sx={{
                                            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                                            lineHeight: 1.2,
                                            wordBreak: 'break-word'
                                        }}
                                    >
                                        {formatCurrency(totalRevenue)}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                            opacity: 0.95
                                        }}
                                    >
                                        Total Revenue
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </StatsCard>
                </Box>

                {/* Completed Payments Card */}
                <Box
                    sx={{
                        flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' },
                        minWidth: { xs: '100%', sm: 'auto' }
                    }}
                >
                    <StatsCard gradient={cardGradients[1]}>
                        <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                            <Box
                                display="flex"
                                alignItems="flex-start"
                                flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
                                gap={{ xs: 1.5, sm: 2 }}
                            >
                                <AccountBalance
                                    sx={{
                                        fontSize: { xs: 32, sm: 36, md: 40 },
                                        opacity: 0.8,
                                        mr: { xs: 0, sm: 2 },
                                        flexShrink: 0
                                    }}
                                />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        variant="h5"
                                        fontWeight="bold"
                                        gutterBottom
                                        sx={{
                                            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                                            lineHeight: 1.2,
                                            wordBreak: 'break-word'
                                        }}
                                    >
                                        {completedPayments}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                            opacity: 0.95
                                        }}
                                    >
                                        Completed Payments
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </StatsCard>
                </Box>

                {/* Pending Payments Card */}
                <Box
                    sx={{
                        flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' },
                        minWidth: { xs: '100%', sm: 'auto' }
                    }}
                >
                    <StatsCard gradient={cardGradients[2]}>
                        <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                            <Box
                                display="flex"
                                alignItems="flex-start"
                                flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
                                gap={{ xs: 1.5, sm: 2 }}
                            >
                                <Payment
                                    sx={{
                                        fontSize: { xs: 32, sm: 36, md: 40 },
                                        opacity: 0.8,
                                        mr: { xs: 0, sm: 2 },
                                        flexShrink: 0
                                    }}
                                />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        variant="h5"
                                        fontWeight="bold"
                                        gutterBottom
                                        sx={{
                                            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                                            lineHeight: 1.2,
                                            wordBreak: 'break-word'
                                        }}
                                    >
                                        {pendingPayments}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                            opacity: 0.95
                                        }}
                                    >
                                        Pending Payments
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </StatsCard>
                </Box>

                {/* Total Transactions Card */}
                <Box
                    sx={{
                        flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' },
                        minWidth: { xs: '100%', sm: 'auto' }
                    }}
                >
                    <StatsCard gradient={cardGradients[3]}>
                        <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                            <Box
                                display="flex"
                                alignItems="flex-start"
                                flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
                                gap={{ xs: 1.5, sm: 2 }}
                            >
                                <TrendingUp
                                    sx={{
                                        fontSize: { xs: 32, sm: 36, md: 40 },
                                        opacity: 0.8,
                                        mr: { xs: 0, sm: 2 },
                                        flexShrink: 0
                                    }}
                                />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        variant="h5"
                                        fontWeight="bold"
                                        gutterBottom
                                        sx={{
                                            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                                            lineHeight: 1.2,
                                            wordBreak: 'break-word'
                                        }}
                                    >
                                        {filteredPayments.length}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                            opacity: 0.95
                                        }}
                                    >
                                        Total Transactions
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </StatsCard>
                </Box>
            </Box>



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

            {/* Payments Table */}
            <PaymentTableContainer>
                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                {/* <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Payment ID</TableCell> */}
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
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Box py={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                            <CircularProgress size={40} />
                                            <Typography variant="body1" color="text.secondary">
                                                Loading payments...
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : filteredPayments.length === 0 ? (
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
                                        {/* <TableCell>
                                            <Typography variant="body2" fontWeight="medium" color="primary">
                                                #{payment.payment_id}
                                            </Typography>
                                        </TableCell> */}
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
                                            <Box display="flex" alignItems="center">
                                                <Tooltip title="Edit Payment">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleOpenEdit(payment)}
                                                    >
                                                        <Edit />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Delete Payment">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeletePayment(payment)}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleViewDetails(payment)}
                                                    >
                                                        <Visibility />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </PaymentTableContainer>

            {/* Edit Payment Modal */}
            <Dialog
                open={editModalOpen}
                onClose={handleCloseEdit}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 2 } }}
            >
                <DialogTitle>Edit Payment</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        {/* <FormControl size="small">
                            <InputLabel>Payment Status</InputLabel>
                            <Select
                                value={editForm.payment_status}
                                label="Payment Status"
                                onChange={handleEditChange('payment_status')}
                            >
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="paid">Paid</MenuItem>
                                <MenuItem value="failed">Failed</MenuItem>
                                <MenuItem value="cancelled">Cancelled</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small">
                            <InputLabel>Validity Status</InputLabel>
                            <Select
                                value={editForm.validity_status}
                                label="Validity Status"
                                onChange={handleEditChange('validity_status')}
                            >
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="expired">Expired</MenuItem>
                            </Select>
                        </FormControl> */}

                        <TextField
                            label="Base Amount"
                            size="small"
                            value={editForm.base_amount}
                            onChange={handleEditChange('base_amount')}
                            type="number"
                            InputProps={{ inputProps: { min: 0 } }}
                        />

                        <TextField
                            label="Sessions Remaining"
                            size="small"
                            value={editForm.sessions_remaining}
                            onChange={handleEditChange('sessions_remaining')}
                            type="number"
                            InputProps={{ inputProps: { min: 0 } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleCloseEdit} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleSaveEdit}
                        variant="contained"
                        color="primary"
                        disabled={isSavingEdit}
                    >
                        {isSavingEdit ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Link Warning Dialog - shows where the payment is referenced */}
            <Dialog
                open={linkWarningOpen}
                onClose={() => { setLinkWarningOpen(false); setLinkWarningData(null); }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Cannot modify payment — linked records found</DialogTitle>
                <DialogContent>
                    <Box>
                        <Typography variant="body2" color="textSecondary" mb={2}>
                            This payment is referenced by other records and cannot be updated or deleted. See details below.
                        </Typography>

                        {linkWarningData?.sessions && (
                            <Box mb={2}>
                                <Typography variant="subtitle2">Linked Sessions</Typography>
                                {linkWarningData.sessions.map(s => (
                                    <Box key={s.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'grey.100' }}>
                                        <Typography variant="body2">Session ID: {s.id}</Typography>
                                        <Typography variant="body2">Date: {s.session_date ? new Date(s.session_date).toLocaleString() : 'N/A'}</Typography>
                                        <Typography variant="body2">Status: {s.status}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}

                        {linkWarningData?.renewals && (
                            <Box>
                                <Typography variant="subtitle2">Linked Renewals (payments referencing this as original)</Typography>
                                {linkWarningData.renewals.map(r => (
                                    <Box key={r.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'grey.100' }}>
                                        <Typography variant="body2">Payment ID: {r.id}</Typography>
                                        <Typography variant="body2">Student: {r.student_id || 'N/A'}</Typography>
                                        <Typography variant="body2">Status: {r.payment_status}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}

                        {linkWarningData?.hireRequests && (
                            <Box mt={2}>
                                {console.log("linkWarningData.hireRequests", linkWarningData.hireRequests)}
                                <Typography variant="subtitle2">Linked Hire Requests</Typography>
                                {linkWarningData.hireRequests.map(hr => {
                                    const id = hr.id || hr._id || hr.hire_request_id || 'N/A';
                                    const subject = hr.subject || hr.subject_name || hr.subject_id || 'N/A';
                                    const level = hr.academic_level_name || hr.academic_level_id || hr.level || 'N/A';
                                    const status = hr.status || hr.hire_status || 'N/A';
                                    const hiredAt = hr.hired_at || hr.createdAt || hr.created_at || hr.date || null;
                                    return (
                                        <Box key={id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'grey.100' }}>
                                            {/* <Typography variant="body2">Request ID: {id}</Typography> */}
                                            <Typography variant="body2">Subject / Level: {subject} / {level}</Typography>
                                            <Typography variant="body2">Status: {status}</Typography>
                                            <Typography variant="body2">{hiredAt ? new Date(hiredAt).toLocaleString() : ''}</Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setLinkWarningOpen(false); setLinkWarningData(null); }} variant="contained">Close</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={() => { if (!isDeletingPayment) { setDeleteConfirmOpen(false); setDeleteTargetPayment(null); } }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Confirm delete payment</DialogTitle>
                <DialogContent>
                    <Box>
                        <Typography variant="body1" gutterBottom>
                            Are you sure you want to delete payment? This action cannot be undone.
                        </Typography>
                        {deleteTargetPayment && (
                            <Box sx={{ mt: 2, p: 2, borderRadius: 1, backgroundColor: 'grey.50' }}>

                                <DetailRow>
                                    <Typography variant="body2" color="text.secondary">Student:</Typography>
                                    <Typography variant="body2" fontWeight="bold">{deleteTargetPayment.student_name || 'N/A'}</Typography>
                                </DetailRow>
                                <DetailRow>
                                    <Typography variant="body2" color="text.secondary">Tutor:</Typography>
                                    <Typography variant="body2" fontWeight="bold">{deleteTargetPayment.tutor_name || 'N/A'}</Typography>
                                </DetailRow>
                                <DetailRow>
                                    <Typography variant="body2" color="text.secondary">Amount:</Typography>
                                    <Typography variant="body2" fontWeight="bold">{formatCurrency(deleteTargetPayment.final_amount)}</Typography>
                                </DetailRow>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => { setDeleteConfirmOpen(false); setDeleteTargetPayment(null); }}
                        color="inherit"
                        disabled={isDeletingPayment}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={performDeletePayment}
                        color="error"
                        variant="contained"
                        disabled={isDeletingPayment}
                    >
                        {isDeletingPayment ? 'Deleting...' : 'Delete Payment'}
                    </Button>
                </DialogActions>
            </Dialog>

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
                                            {/* <div className='flex flex-row'> */}
                                            <Box textAlign="right" className='ml-5 flex gap-4'>
                                                <Typography variant="body2" fontWeight="bold" color="text.primary">
                                                    {formatDate(selectedPayment.validity_start_date)}
                                                </Typography>
                                                <Typography variant="body2" fontWeight="medium" color="text.primary">
                                                    to
                                                </Typography>
                                                <Typography variant="body2" fontWeight="bold" color="text.primary">
                                                    {formatDate(selectedPayment.validity_end_date)}
                                                </Typography>
                                            </Box>
                                            {/* </div> */}
                                        </DetailRow>
                                        <DetailRow icon={<Event />}>
                                            <Typography variant="body2" color="text.secondary">Payment Date:</Typography>
                                            <Typography variant="body2" fontWeight="bold" color="text.primary">
                                                {formatDate(selectedPayment.validity_start_date)}
                                            </Typography>
                                        </DetailRow>
                                    </Box>
                                </Grid>

                                <Grid className=' flex gap-6 justify-center items-center mt-4'>

                                    {/* Student Information with Avatar */}
                                    <Grid item xs={12} sm={6}>
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
                                                {/* <Box
                                                    component="img"
                                                    src={selectedPayment.stphoto_url || ''}
                                                    alt={selectedPayment.student_name || 'Student'}
                                                    sx={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', mr: { xs: 0, sm: 2 }, mb: { xs: 2, sm: 0 } }}
                                                />
                                                {selectedPayment.student_name ? selectedPayment.student_name.charAt(0).toUpperCase() : 'S'} */}
                                                <div className="w-14 h-14 mr-3 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                                                    {selectedPayment?.stphoto_url ? (
                                                        <img
                                                            src={selectedPayment.stphoto_url}
                                                            alt="Profile"
                                                            className="h-full w-full object-cover rounded-full transition-opacity duration-300 opacity-100"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-gray-600" />
                                                    )}
                                                    {!selectedPayment.stphoto_url && (
                                                        <div className="relative z-10 text-white flex items-center justify-center w-full h-full">
                                                            <User className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>
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
                                                {/* <Box
                                                    component="img"
                                                    src={selectedPayment.tphoto_url || ''}
                                                    alt={selectedPayment.tutor_name || 'Tutor'}
                                                    sx={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', mr: { xs: 0, sm: 2 }, mb: { xs: 2, sm: 0 } }}
                                                /> */}
                                                <div className="w-14 h-14 mr-3 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                                                    {selectedPayment.tphoto_url ? (
                                                        <img
                                                            src={selectedPayment.tphoto_url}
                                                            alt="Profile"
                                                            className="h-full w-full object-cover rounded-full transition-opacity duration-300 opacity-100"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-gray-600" />
                                                    )}
                                                    {!selectedPayment.tphoto_url && (
                                                        <div className="relative z-10 text-white flex items-center justify-center w-full h-full">
                                                            <User className="h-12 w-12" />
                                                        </div>
                                                    )}
                                                </div>
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
        //  </AdminLayout> 
    );
};

export default TutorPayments;