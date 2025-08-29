import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useParent } from '../../../contexts/ParentContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  Users,
  BookOpen,
  TrendingUp,
  Calendar,
  Plus,
  Eye,
  Edit,
  User
} from 'lucide-react';
import AddChildModal from '../AddChildModal';
import { BASE_URL } from '../../../config';

const OverviewPage = ({ onTabChange }) => {
  const { user } = useAuth();
  const { getParentProfile, getParentDashboardStats } = useParent();
  const navigate = useNavigate();
  const [parentProfile, setParentProfile] = useState(null);
  const [children, setChildren] = useState([]);
  const [stats, setStats] = useState({
    totalChildren: 0,
    activeChildren: 0,
    inactiveChildren: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddChildModal, setShowAddChildModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileData, statsData] = await Promise.all([
        getParentProfile(user._id),
        getParentDashboardStats(user._id)
      ]);

      setParentProfile(profileData.parentProfile);
      setChildren(profileData.children || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChildAdded = (newChild) => {
    setChildren(prev => [...prev, newChild]);
    setStats(prev => ({
      ...prev,
      totalChildren: prev.totalChildren + 1,
      activeChildren: prev.activeChildren + 1
    }));
    // Dispatch custom event to update other components
    window.dispatchEvent(new CustomEvent('parentDataUpdated'));
  };

  const handleChildDeleted = (childId) => {
    setChildren(prev => prev.filter(child => child._id !== childId));
    setStats(prev => ({
      ...prev,
      totalChildren: prev.totalChildren - 1
    }));
    window.dispatchEvent(new CustomEvent('parentDataUpdated'));
  };

  if (loading) {
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
              Dashboard Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome back, {user?.full_name}! Here's what's happening with your children.
            </p>
          </div>
          <Button
            onClick={() => onTabChange('children')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Child
          </Button>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.full_name}! 👋
        </h1>
        <p className="text-primary-100 text-lg">
          Here's an overview of your children's tutoring progress and upcoming activities.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Children</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChildren}</div>
            <p className="text-xs text-muted-foreground">
              Registered students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Children</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeChildren}</div>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£0</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>



      {/* Recent Children */}
      <Card>
        <CardHeader>
          <CardTitle>My Children</CardTitle>
          <CardDescription>
            Overview of your registered children
          </CardDescription>
        </CardHeader>
        <CardContent>
          {children.length === 0 ? (
            <div className="text-center py-12">
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
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {children.slice(0, 3).map((child) => (
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
                        variant={child.is_verified === 'active' ? 'default' : 'secondary'}
                        className="text-xs px-3 py-1 rounded-full flex-shrink-0 ml-2"
                      >
                        {child.is_verified === 'active' ? 'Active' : 'Pending'}
                      </Badge>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Age</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {child.age} years
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Level</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {child.academic_level?.level || 'Not specified'}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 group-hover:border-primary group-hover:text-primary transition-colors">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 group-hover:border-primary group-hover:text-primary transition-colors">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {children.length > 3 && (
            <div className="text-center mt-6">
              <Button
                variant="outline"
                className="px-6 py-2"
                onClick={() => onTabChange('children')}
              >
                View All Children ({children.length})
              </Button>
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

    </div>
  );
};

export default OverviewPage; 
