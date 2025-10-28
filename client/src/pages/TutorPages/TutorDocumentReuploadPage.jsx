import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { BASE_URL } from '../../config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Upload,
  RefreshCw,
  FileText,
  AlertTriangle
} from 'lucide-react';

const TutorDocumentReuploadPage = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [profileStatusReason, setProfileStatusReason] = useState('');

  useEffect(() => {
    if (user?._id) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/api/tutor/rejected-documents/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        setDocuments(data.documents);
        setProfileStatusReason(data.profile_status_reason || '');
      } else {
        toast.error(data.message || 'Failed to fetch documents');
      }
    } catch (error) {
      //console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (documentType) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid file (PDF, JPG, PNG, DOC, DOCX)');
        return;
      }

      await uploadDocument(file, documentType);
    };
    fileInput.click();
  };

  const uploadDocument = async (file, documentType) => {
    try {
      setUploading(prev => ({ ...prev, [documentType]: true }));
      
      const formData = new FormData();
      formData.append('document', file);
      formData.append('document_type', documentType);

      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/api/tutor/reupload-document/${user._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Document uploaded successfully');
        fetchDocuments(); // Refresh the list
      } else {
        toast.error(data.message || 'Failed to upload document');
      }
    } catch (error) {
      //console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'missing':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'missing':
        return <Badge variant="secondary">Missing</Badge>;
      default:
        return <Badge variant="default">Approved</Badge>;
    }
  };

  const getDocumentDescription = (documentType) => {
    const descriptions = {
      'ID Proof': 'Government-issued ID (Passport, Driver\'s License, National ID)',
      'Address Proof': 'Utility bill, bank statement, or official document with your address',
      'Degree': 'Educational degree certificate or transcript',
      'Certificate': 'Professional certification or training certificate',
      'Reference Letter': 'Letter of recommendation from previous employer or colleague',
    };
    return descriptions[documentType] || 'Document required for verification';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading documents...</span>
        </div>
      </div>
    );
  }

  const rejectedOrPendingDocs = documents.filter(doc => 
    doc.status === 'rejected' || doc.status === 'pending' || doc.status === 'missing'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Re-upload</h1>
          <p className="text-gray-600 mt-1">
            Re-upload documents that were rejected or need to be updated
          </p>
        </div>
      </div>

      {/* Admin Message */}
      {profileStatusReason && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-800">Admin Feedback</h3>
              <p className="text-orange-700 mt-1">{profileStatusReason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-800">
            {rejectedOrPendingDocs.length} document(s) need attention
          </span>
        </div>
        <p className="text-blue-700 text-sm mt-1">
          Please re-upload the documents below. New uploads will replace existing documents.
        </p>
      </div>

      {/* Documents List */}
      <div className="grid gap-4">
        {documents.map((doc, index) => (
          <Card key={index} className={`border-l-4 ${
            doc.status === 'rejected' ? 'border-l-red-500' : 
            doc.status === 'pending' ? 'border-l-yellow-500' : 'border-l-orange-500'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(doc.status)}
                  <div>
                    <CardTitle className="text-lg">{doc.document_type}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {getDocumentDescription(doc.document_type)}
                    </p>
                  </div>
                </div>
                {getStatusBadge(doc.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {doc.document && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Current Document
                      </p>
                      <p className="text-xs text-gray-500">
                        Uploaded: {new Date(doc.document.uploaded_at).toLocaleDateString()}
                      </p>
                      {doc.document.notes && (
                        <p className="text-xs text-red-600 mt-1">
                          Admin Note: {doc.document.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {doc.document.file_url && doc.document.file_url !== '#' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`${BASE_URL}${doc.document.file_url}`, '_blank')}
                        >
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleFileUpload(doc.document_type)}
                  disabled={uploading[doc.document_type] || doc.status === 'approved'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {uploading[doc.document_type] ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {doc.document ? 'Re-upload' : 'Upload'}
                    </>
                  )}
                </Button>
                {doc.status === 'approved' && (
                  <span className="text-sm text-green-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approved
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-800 mb-2">Instructions</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Upload clear, high-quality images or PDF files</li>
          <li>• Ensure all text is readable and documents are not expired</li>
          <li>• New uploads will replace existing documents</li>
          <li>• Documents will be reviewed within 2-3 business days</li>
          <li>• You will be notified once the review is complete</li>
        </ul>
      </div>
    </div>
  );
};

export default TutorDocumentReuploadPage;
