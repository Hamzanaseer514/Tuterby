import React from "react";
import { useParams } from "react-router-dom";
import TutorDetailPage from "./TutorDetailPage";
import StudentDetailPage from "./StudentDetailPage";
import ParentDetailPage from "./ParentDetailPage";

const AdminUserDetailRouter = () => {
  const { tabValue } = useParams();

  switch (tabValue) {
    case "tutors":
      return <TutorDetailPage />;
    case "students":
      return <StudentDetailPage />;
    case "parents":
      return <ParentDetailPage />;
    default:
      return <TutorDetailPage />;
  }
};

export default AdminUserDetailRouter;


