import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useParent } from '../../../contexts/ParentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
    Users,
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    UserPlus,
    BookOpen,
    Calendar,
    TrendingUp,
    User
} from 'lucide-react';
import AddChildModal from '../AddChildModal';
import DeleteChildModal from '../DeleteChildModal';
import { BASE_URL } from '../../../config';
import { useNavigate } from 'react-router-dom';

const ChildrenPage = () => {
    const { user, getAuthToken, fetchWithAuth } = useAuth();
    const { getParentProfile, deleteChildFromParent, loading } = useParent();
    const [children, setChildren] = useState([]);
    const [filteredChildren, setFilteredChildren] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [showAddChildModal, setShowAddChildModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [childToDelete, setChildToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        filterChildren();
    }, [children, searchTerm, filterStatus]);

    const fetchChildren = async () => {
        try {
            setPageLoading(true);
            const data = await getParentProfile(user._id);
            setChildren(data.children || []);
        } catch (error) {
            // console.error('Error fetching children:', error);
        } finally {
            setPageLoading(false);
        }
    };

    const filterChildren = () => {
        let filtered = children;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(child =>
                child.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                child.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                child.academic_level?.level?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(child => child.is_verified === filterStatus);
        }

        setFilteredChildren(filtered);
    };

    const handleChildAdded = (newChild) => {
        setChildren(prev => [...prev, newChild]);
        window.dispatchEvent(new CustomEvent('parentDataUpdated'));
    };

    const handleDeleteClick = (child) => {
        setChildToDelete(child);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!childToDelete) return;

        try {
            await deleteChildFromParent(childToDelete._id, user._id);
            setChildren(prev => prev.filter(child => child._id !== childToDelete._id));
            window.dispatchEvent(new CustomEvent('parentDataUpdated'));
            setShowDeleteModal(false);
            setChildToDelete(null);
        } catch (error) {
            // Error is already handled in the context with toast
            // console.error('Error deleting child:', error);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setChildToDelete(null);
    };

    const handleChildUpdated = (updatedChild) => {
        setChildren(prev =>
            prev.map(child =>
                child._id === updatedChild._id ? updatedChild : child
            )
        );
        window.dispatchEvent(new CustomEvent('parentDataUpdated'));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'inactive':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'partial_active':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    if (pageLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-center sm:text-left">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            My Children
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                            Manage your children's tutoring accounts and profiles
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowAddChildModal(true)}
                        className="flex items-center gap-2 w-full sm:w-auto justify-center"
                        size="sm"
                    >
                        <Plus className="h-4 w-4" />
                        Add Child
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                        <CardTitle className="text-sm font-medium">Total Children</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                        <div className="text-2xl font-bold">{children.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Registered students
                        </p>
                    </CardContent>
                </Card>

                <Card className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                        <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                        <div className="text-2xl font-bold text-green-600">
                            {children.filter(c => c.is_verified === 'active').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Currently active
                        </p>
                    </CardContent>
                </Card>

                <Card className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Sessions completed
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter Section */}
            <Card className="w-full">
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl">Children ({filteredChildren.length})</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        {filteredChildren.length === children.length
                            ? 'All your registered children'
                            : `Showing ${filteredChildren.length} of ${children.length} children`
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                    {/* Search and Filter Controls */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search children by name, email, or academic level..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="partial_active">Partial</option>
                        </select>
                    </div>

                    {filteredChildren.length === 0 ? (
                        <div className="text-center py-8 sm:py-12">
                            {children.length === 0 ? (
                                <>
                                    <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No children registered yet
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                                        Start by adding your first child to begin their tutoring journey
                                    </p>
                                    <Button 
                                        onClick={() => setShowAddChildModal(true)}
                                        className="w-full sm:w-auto"
                                    >
                                        Add Your First Child
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Search className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No children found
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">
                                        Try adjusting your search terms or filters
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setFilterStatus('all');
                                        }}
                                        className="w-full sm:w-auto"
                                    >
                                        Clear Filters
                                    </Button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
                            {filteredChildren.map((child) => (
                                <Card 
                                    key={child._id} 
                                    className="group hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 w-full"
                                >
                                    <CardContent className="p-4 sm:p-6">
                                        {/* Header with Avatar */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 flex-shrink-0 overflow-hidden">
                                                    {child.photo_url ? (
                                                        <img 
                                                            src={`${BASE_URL}${child.photo_url}`}
                                                            alt={child.full_name} 
                                                            className="h-full w-full object-cover rounded-full"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full rounded-full flex items-center justify-center text-white bg-primary">
                                                            <User className="h-5 w-5 sm:h-6 sm:w-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg group-hover:text-primary transition-colors truncate">
                                                        {child.full_name}
                                                    </h4>
                                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                                                        {child.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge
                                                className={`text-xs px-2 py-1 sm:px-3 sm:py-1 rounded-full flex-shrink-0 ml-2 ${getStatusColor(child.is_verified)}`}
                                            >
                                                {child.is_verified === 'active' ? 'Active' :
                                                    child.is_verified === 'inactive' ? 'Inactive' : 'Partial'}
                                            </Badge>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                                            <div className="flex justify-between items-center py-1 sm:py-2 border-b border-gray-100 dark:border-gray-700">
                                                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Age:</span>
                                                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                                    {child.age} years old
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center py-1 sm:py-2 border-b border-gray-100 dark:border-gray-700">
                                                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Academic Level:</span>
                                                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-right">
                                                    {child.academic_level?.level || 'Not specified'}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center py-1 sm:py-2 border-b border-gray-100 dark:border-gray-700">
                                                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Joined:</span>
                                                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                                    {new Date(child.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 mb-3 sm:mb-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 text-xs group-hover:border-primary group-hover:text-primary transition-colors h-8 sm:h-9"
                                                onClick={() =>
                                                    navigate(
                                                        `/parent-dashboard/children/${child.full_name.toLowerCase().replace(/\s+/g, '-')
                                                        }-${child._id.slice(-6)}`
                                                    )
                                                }
                                            >
                                                <Eye className="h-3 w-3 sm:mr-1" />
                                                <span className="hidden sm:inline">View</span>
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 text-xs group-hover:border-primary group-hover:text-primary transition-colors h-8 sm:h-9"
                                                onClick={() =>
                                                    navigate(
                                                        `/parent-dashboard/children/${child.full_name.toLowerCase().replace(/\s+/g, '-')
                                                        }-${child._id.slice(-6)}/edit`
                                                    )
                                                }
                                            >
                                                <Edit className="h-3 w-3 sm:mr-1" />
                                                <span className="hidden sm:inline">Edit</span>
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteClick(child)}
                                                className="text-red-600 hover:text-red-700 hover:border-red-600 transition-colors h-8 sm:h-9 w-8 sm:w-9 flex-shrink-0"
                                                disabled={loading}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <div className="flex gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="flex-1 text-xs h-8 sm:h-9"
                                                >
                                                    <BookOpen className="h-3 w-3 mr-1" />
                                                    <span className="hidden xs:inline">Schedule</span>
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="flex-1 text-xs h-8 sm:h-9"
                                                >
                                                    <TrendingUp className="h-3 w-3 mr-1" />
                                                    <span className="hidden xs:inline">Progress</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Child Modal */}
            <AddChildModal
                isOpen={showAddChildModal}
                onClose={() => setShowAddChildModal(false)}
                onChildAdded={handleChildAdded}
                parentUserId={user._id}
            />

            {/* Delete Child Modal */}
            <DeleteChildModal
                isOpen={showDeleteModal}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                childName={childToDelete?.full_name || ''}
                loading={loading}
            />
        </div>
    );
};

export default ChildrenPage;