import React from 'react';
import { useParams } from 'react-router-dom';
import AvailabilityCalendar from '../components/tutor/AvailabilityCalendar';

const TutorAvailabilityPage = () => {
  const { tutorId } = useParams();

  return <AvailabilityCalendar tutorId={tutorId} />;
};

export default TutorAvailabilityPage; 