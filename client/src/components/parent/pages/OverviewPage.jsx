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
      <div className="flex justify-center items-center min-h-64 py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      {/* Page Header */}
      {/* <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">
              Dashboard Overview
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 truncate">
              Welcome back, {user?.full_name}! Here's what's happening with your children.
            </p>
          </div>
          <Button
            onClick={() => setShowAddChildModal(true)}
            className="flex items-center gap-2 w-full xs:w-auto text-xs sm:text-sm"
            size="sm"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            Add New Child
          </Button>
        </div>
      </div> */}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-4 sm:p-6 text-white">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
          Welcome back, {user?.full_name}! 👋
        </h1>
        <p className="text-primary-100 text-sm sm:text-base lg:text-lg opacity-90">
          Here's an overview of your children's tutoring progress and upcoming activities.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Children</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold">{stats.totalChildren}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered students
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Children</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.activeChildren}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sessions completed
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Spent</CardTitle>
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold">£0</div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Children */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl lg:text-2xl">My Children</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Overview of your registered children
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          {children.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 dark:text-white mb-2">
                No children registered yet
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto">
                Start by adding your first child to begin their tutoring journey
              </p>
              <Button 
                onClick={() => setShowAddChildModal(true)}
                size="sm"
                className="text-xs sm:text-sm"
              >
                Add Your First Child
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {children.slice(0, 3).map((child) => (
                  <Card 
                    key={child._id} 
                    className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 flex flex-col h-full"
                  >
                    <CardContent className="p-4 sm:p-6 flex flex-col flex-1">
                      {/* Header with Avatar */}
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                            {child.photo_url ? (
                              <img 
                                src={`${BASE_URL}${child.photo_url}`}
                                alt={`${child.full_name}'s profile`}
                                className="h-full w-full object-cover rounded-full"
                              />
                            ) : (
                              child.full_name?.charAt(0) || (
                                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-white">
                                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                                </div>
                              )
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base lg:text-lg group-hover:text-primary transition-colors truncate">
                              {child.full_name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {child.email}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={child.is_verified === 'active' ? 'default' : 'secondary'}
                          className="text-xs px-2 py-0.5 sm:px-3 sm:py-1 rounded-full flex-shrink-0 ml-2"
                        >
                          {child.is_verified === 'active' ? 'Active' : 'Pending'}
                        </Badge>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6 flex-1">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Age</div>
                          <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                            {child.age} years
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Level</div>
                          <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                            {child.academic_level?.level || 'Not specified'}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-xs h-8 group-hover:border-primary group-hover:text-primary transition-colors"
                          onClick={() =>
                            navigate(
                              `/parent-dashboard/children/${child.full_name.toLowerCase().replace(/\s+/g, '-')}-${child._id.slice(-6)}`
                            )
                          }
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-xs h-8 group-hover:border-primary group-hover:text-primary transition-colors"
                          onClick={() =>
                            navigate(
                              `/parent-dashboard/children/${child.full_name.toLowerCase().replace(/\s+/g, '-')}-${child._id.slice(-6)}/edit`
                            )
                          }
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {children.length > 3 && (
                <div className="text-center mt-4 sm:mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-4 sm:px-6 py-2 text-xs sm:text-sm"
                    onClick={() => {
                      navigate('/parent-dashboard/children');
                    }}
                  >
                    View All Children ({children.length})
                  </Button>
                </div>
              )}
            </>
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