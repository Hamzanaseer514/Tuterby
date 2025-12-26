import React, { useState, useEffect } from 'react';
import { BASE_URL } from '@/config';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  MessageSquare,
  Clock,
  User,
  BookOpen,
  Reply,
  CheckCircle,
  AlertCircle,
  Eye,
  XCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const InquiryManagement = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const { user, getAuthToken, fetchWithAuth } = useAuth();

  useEffect(() => {
    if (user) {
      fetchInquiries();
    }
  }, [user, filter]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      // Only include status parameter if filter is not 'all'
      const url = filter === 'all'
        ? `${BASE_URL}/api/tutor/inquiries/${user._id}`
        : `${BASE_URL}/api/tutor/inquiries/${user._id}?status=${filter}`;

      const response = await fetchWithAuth(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }, getAuthToken(), (newToken) => localStorage.setItem("authToken", newToken));

      if (!response.ok) {
        throw new Error('Failed to fetch inquiries');
      }
      const data = await response.json();
      setInquiries(data.inquiries || []);
    } catch (err) {
      // console.error('Error fetching inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const replyToInquiry = async (inquiryId) => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/tutor/inquiries/${inquiryId}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reply_message: replyMessage }),
      }, getAuthToken(), (newToken) => localStorage.setItem("authToken", newToken));

      if (!response.ok) {
        throw new Error('Failed to send reply');
      }

      // Refresh inquiries after reply
      fetchInquiries();
      setShowReplyModal(false);
      setReplyMessage('');
      setSelectedInquiry(null);
    } catch (err) {
      // console.error('Error sending reply:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'bg-red-100 text-red-800';
      case 'read': return 'bg-yellow-100 text-yellow-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'converted_to_booking': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'unread': return <AlertCircle className="h-4 w-4" />;
      case 'read': return <Eye className="h-4 w-4" />;
      case 'replied': return <Reply className="h-4 w-4" />;
      case 'converted_to_booking': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getActionButton = (inquiry) => {
    if (inquiry.status === 'unread' || inquiry.status === 'read') {
      return (
        <Button
          size="sm"
          onClick={() => {
            setSelectedInquiry(inquiry);
            setShowReplyModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Reply className="h-4 w-4 mr-1" />
          Reply
        </Button>
      );
    }
    return (
      <Button size="sm" variant="outline" onClick={() => {
        setSelectedInquiry(inquiry);
        setShowReplyModal(true);
      }}>
        <Eye className="h-4 w-4 mr-1" />
        View
      </Button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inquiry Management</h1>
          <p className="text-gray-600">Manage student inquiries and messages</p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <Label htmlFor="status-filter">Filter by Status:</Label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Inquiries</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="converted_to_booking">Converted to Booking</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Inquiries List */}
        <div className="grid gap-6">
          {inquiries.length > 0 ? (
            inquiries.map((inquiry) => (
              <Card key={inquiry._id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base">{inquiry.student_id.user_id.full_name}</h3>
                        <div className='flex gap-1 item-center align-center'> <p className='font-semibold text-gray-600 text-sm'>Subject:</p> <p className="text-gray-600 text-sm">{inquiry.subject}</p></div>
                        <div className='flex gap-1 item-center align-center'> <p className='font-semibold text-gray-600 text-sm'>Academic Level:</p> <p className="text-gray-600 text-sm">{inquiry.academic_level}</p></div>
                        <p className="text-xs text-gray-500">{formatDate(inquiry.createdAt)}</p>

                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(inquiry.status)}>
                        {getStatusIcon(inquiry.status)}
                        <span className="ml-1">{inquiry.status}</span>
                      </Badge>
                      {getActionButton(inquiry)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No inquiries found</h3>
                <p className="text-gray-600">You don't have any inquiries matching the current filter.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Reply Modal */}
        {showReplyModal && selectedInquiry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedInquiry.status === 'replied' ? 'View Inquiry & Response' : 'Reply to Inquiry'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedInquiry.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowReplyModal(false);
                      setReplyMessage('');
                      setSelectedInquiry(null);
                    }}
                    className="text-gray-600"
                  >
                    Close
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {/* Left: Inquiry Details */}
                <div className="flex flex-col space-y-4">
                  <div className='flex gap-1 item-center align-center align-baseline'>
                    <p className="text-sm font-medium text-gray-600">From : </p>
                    <p className="font-semibold text-gray-900">{selectedInquiry?.student_id?.user_id?.full_name || 'Unknown'}</p>
                  </div>

                  <div className="grid grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Subject : </Label>
                      <p className="text-sm text-gray-800 mt-1">{selectedInquiry?.subject || '—'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Academic Level : </Label>
                      <p className="text-sm text-gray-800 mt-1">{selectedInquiry?.academic_level || '—'}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Message</Label>
                    <div className="mt-1 p-4 bg-gray-50 rounded-lg border">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedInquiry?.message || selectedInquiry?.description || 'No message provided'}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <Badge className="mt-2 ml-2">{selectedInquiry?.status || 'unknown'}</Badge>
                  </div>

                  {selectedInquiry?.status === 'replied' && (
                    <div className="mt-2 flex gap-2 items-center">
                      <p className="text-sm font-medium text-gray-600">Response Time: </p>
                      <p className="text-sm text-gray-700 mt-1">{Math.round(selectedInquiry.response_time_minutes)} minutes</p>
                    </div>
                  )}
                </div>

                {/* Right: Reply / View Response */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Reply</Label>

                    {selectedInquiry?.status === 'replied' ? (
                      <div className="mt-1 p-4 bg-gray-50 rounded-lg border min-h-[160px]">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedInquiry?.reply_message || 'No reply provided'}</p>
                      </div>
                    ) : (
                      <div>
                        <Textarea
                          id="reply-message"
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Type your reply here..."
                          className="mt-1 min-h-[160px]"
                        />
                        <p className="text-xs text-gray-500 mt-2">Your reply will be sent to the student and saved in the inquiry thread.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowReplyModal(false);
                        setReplyMessage('');
                        setSelectedInquiry(null);
                      }}
                    >
                      Cancel
                    </Button>

                    {selectedInquiry?.status !== 'replied' && (
                      <Button
                        onClick={() => replyToInquiry(selectedInquiry._id)}
                        disabled={!replyMessage.trim()}
                      >
                        Send Reply
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InquiryManagement; 