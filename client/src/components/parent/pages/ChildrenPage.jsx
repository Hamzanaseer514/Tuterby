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
    const { user } = useAuth();
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
            console.error('Error fetching children:', error);
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
            console.error('Error deleting child:', error);
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
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            My Children
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage your children's tutoring accounts and profiles
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowAddChildModal(true)}
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Child
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Children</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{children.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Registered students
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {children.filter(c => c.is_verified === 'active').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Currently active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Sessions completed
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Children List */}
            <Card>
                <CardHeader>
                    <CardTitle>Children ({filteredChildren.length})</CardTitle>
                    <CardDescription>
                        {filteredChildren.length === children.length
                            ? 'All your registered children'
                            : `Showing ${filteredChildren.length} of ${children.length} children`
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredChildren.length === 0 ? (
                        <div className="text-center py-12">
                            {children.length === 0 ? (
                                <>
                                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No children registered yet
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                                        Start by adding your first child to begin their tutoring journey
                                    </p>
                                    <Button onClick={() => setShowAddChildModal(true)}>
                                        Add Your First Child
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No children found
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                                        Try adjusting your search terms or filters
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setFilterStatus('all');
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredChildren.map((child) => (
                                <Card key={child._id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                                    <CardContent className="p-6">
                                        {/* Header with Avatar */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                                                    {child.photo_url ? (
                                                        <img src={`${BASE_URL}${child.photo_url}`}
                                                            alt="Profile" className="h-full w-full object-cover rounded-full" />
                                                    ) : (
                                                        child.full_name?.charAt(0) || <div className="h-10 w-10 rounded-full flex items-center justify-center text-black"> <User className="h-5 w-5" /></div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white text-lg group-hover:text-primary transition-colors truncate">
                                                        {child.full_name}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                        {child.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge
                                                className={`text-xs px-3 py-1 rounded-full flex-shrink-0 ml-2 ${getStatusColor(child.is_verified)}`}
                                            >
                                                {child.is_verified === 'active' ? 'Active' :
                                                    child.is_verified === 'inactive' ? 'Inactive' : 'Partial'}
                                            </Badge>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Age:</span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {child.age} years old
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Academic Level:</span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {child.academic_level?.level || 'Not specified'}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Joined:</span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {new Date(child.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 group-hover:border-primary group-hover:text-primary transition-colors"
                                                onClick={() =>
                                                    navigate(
                                                        `/parent-dashboard/children/${child.full_name.toLowerCase().replace(/\s+/g, '-')
                                                        }-${child._id.slice(-6)}`
                                                    )
                                                }
                                            >
                                                <Eye className="h-3 w-5" />
                                                View
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 group-hover:border-primary group-hover:text-primary transition-colors"
                                                onClick={() =>
                                                    navigate(
                                                        `/parent-dashboard/children/${child.full_name.toLowerCase().replace(/\s+/g, '-')
                                                        }-${child._id.slice(-6)}/edit`
                                                    )
                                                }
                                            >
                                                <Edit className="h-3 w-3 mr-1" />
                                                Edit
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteClick(child)}
                                                className="text-red-600 hover:text-red-700 hover:border-red-600 transition-colors"
                                                disabled={loading}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" className="flex-1 text-xs">
                                                    <BookOpen className="h-3 w-3 mr-1" />
                                                    Schedule Session
                                                </Button>
                                                <Button variant="ghost" size="sm" className="flex-1 text-xs">
                                                    <TrendingUp className="h-3 w-3 mr-1" />
                                                    View Progress
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
