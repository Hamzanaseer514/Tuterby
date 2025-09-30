import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const DeleteChildModal = ({ isOpen, onClose, onConfirm, childName, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <Card className="w-full max-w-[95vw] sm:max-w-md mx-auto">
        <CardHeader className="text-center px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
          <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
          </div>
          <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Delete Child Account
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            This action cannot be undone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-red-800 dark:text-red-200 flex-1">
                <p className="font-medium mb-1 sm:mb-2">Warning:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li className="leading-relaxed">
                    This will permanently delete <strong className="break-words">{childName}</strong>'s account
                  </li>
                  <li className="leading-relaxed">All their data, sessions, and progress will be lost</li>
                  <li className="leading-relaxed">This action cannot be reversed</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 text-xs sm:text-sm h-9 sm:h-10 p-2"
              size="sm"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 " />
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 text-xs sm:text-sm h-9 sm:h-10 p-2"
              size="sm"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteChildModal;