import React from "react";
import { useParams } from "react-router-dom";
import TutorDetailPage from "./TutorDetailPage";
import StudentDetailPage from "./StudentDetailPage";
import ParentDetailPage from "./ParentDetailPage";
import { AdminDashboardProvider } from "../../contexts/AdminDashboardContext";

const AdminUserDetailRouter = () => {
  const { tabValue } = useParams();

  switch (tabValue) {
    case "tutors":
      return (
        <AdminDashboardProvider>
          <TutorDetailPage />
        </AdminDashboardProvider>
      );
    case "students":
      return (
        <AdminDashboardProvider>
          <StudentDetailPage />
        </AdminDashboardProvider>
      );
    case "parents":
      return (
        <AdminDashboardProvider>
          <ParentDetailPage />
        </AdminDashboardProvider>
      );
    default:
      return (
        <AdminDashboardProvider>
          <TutorDetailPage />
        </AdminDashboardProvider>
      );
  }
};

export default AdminUserDetailRouter;


