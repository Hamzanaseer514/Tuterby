import React from 'react';
import { useParams } from 'react-router-dom';
import TutorSearch from '../components/student/TutorSearch';

const StudentTutorSearchPage = () => {
  // const { studentId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <TutorSearch />
      </div>
    </div>
  );
};

export default StudentTutorSearchPage; 