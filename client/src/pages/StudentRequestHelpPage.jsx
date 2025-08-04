import React from 'react';
import { useParams } from 'react-router-dom';
import RequestHelp from '../components/student/RequestHelp';
import Layout from '../components/Layout';

const StudentRequestHelpPage = () => {
  const { studentId } = useParams();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <RequestHelp studentId={studentId} />
      </div>
    </Layout>
  );
};

export default StudentRequestHelpPage; 