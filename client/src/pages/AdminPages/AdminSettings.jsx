
// import React, { useState, useEffect } from "react";
// import AdminLayout from "../../components/admin/components/AdminLayout";
// import { BASE_URL } from "@/config";
// import { toast } from "react-toastify";

// const AdminSettings = () => {
//   // State for OTP settings
//   const [otpActive, setOtpActive] = useState(false);
//   const [loadingOtp, setLoadingOtp] = useState(false);
  
//   // State for education levels
//   const [levelInput, setLevelInput] = useState("");
//   const [educationLevels, setEducationLevels] = useState([]);
//   const [filteredLevels, setFilteredLevels] = useState([]);
//   const [loadingLevels, setLoadingLevels] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [levelToDelete, setLevelToDelete] = useState(null);

//   // Fetch initial data
//   useEffect(() => {
//     fetchOtpStatus();
//     fetchEducationLevels();
//   }, []);

//   // Filter education levels based on search term
//   useEffect(() => {
//     if (searchTerm) {
//       const filtered = educationLevels.filter(level =>
//         level.level.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//       setFilteredLevels(filtered);
//     } else {
//       setFilteredLevels(educationLevels);
//     }
//   }, [searchTerm, educationLevels]);

//   const fetchOtpStatus = async () => {
//     try {
//       const res = await fetch(`${BASE_URL}/api/admin/rules/otp-status`);
//       const data = await res.json();
//       setOtpActive(data.data?.otp_rule_active || false);
//     } catch (error) {
//       console.error("Error fetching OTP status:", error);
//       toast.error("Failed to fetch OTP status");
//     }
//   };

//   const fetchEducationLevels = async () => {
//     try {
//       setLoadingLevels(true);
//       const res = await fetch(`${BASE_URL}/api/admin/education-levels`);
//       const data = await res.json();
//       setEducationLevels(data || []);
//       setFilteredLevels(data || []);
//     } catch (error) {
//       console.error("Error fetching education levels:", error);
//       toast.error("Failed to fetch education levels");
//     } finally {
//       setLoadingLevels(false);
//     }
//   };

//   const toggleOtp = async () => {
//     try {
//       setLoadingOtp(true);
//       const res = await fetch(`${BASE_URL}/api/admin/rules/toggle-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//       });
//       const data = await res.json();
//       setOtpActive(data.data?.otp_rule_active);
//       toast.success(`OTP authentication is now ${data.data?.otp_rule_active ? "enabled" : "disabled"}`);
//     } catch (error) {
//       console.error("Error toggling OTP:", error);
//       toast.error("Failed to toggle OTP setting");
//     } finally {
//       setLoadingOtp(false);
//     }
//   };

//   const handleAddOrUpdateLevel = async () => {
//     if (!levelInput.trim()) {
//       toast.error("Please enter an education level");
//       return;
//     }

//     try {
//       if (isEditing && editingId) {
//         // Update existing level
//         const res = await fetch(`${BASE_URL}/api/admin/education-levels/${editingId}`, {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ level: levelInput }),
//         });
        
//         if (!res.ok) {
//           const errorData = await res.json();
//           throw new Error(errorData.message || "Failed to update education level");
//         }

//         const data = await res.json();
//         toast.success(data.message || "Education level updated successfully");
//       } else {
//         // Add new level
//         const res = await fetch(`${BASE_URL}/api/admin/education-levels`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ level: levelInput }),
//         });
        
//         if (!res.ok) {
//           const errorData = await res.json();
//           throw new Error(errorData.message || "Failed to add education level");
//         }

//         const data = await res.json();
//         toast.success(data.message || "Education level added successfully");
//       }
      
//       // Reset form and refresh list
//       setLevelInput("");
//       setEditingId(null);
//       setIsEditing(false);
//       fetchEducationLevels();
//     } catch (error) {
//       console.error("Error saving education level:", error);
//       toast.error(
//         <div>
//           <p className="font-medium">Operation Failed</p>
//           <p>{error.message || "Please try again"}</p>
//         </div>,
//         { autoClose: 5000 }
//       );
//     }
//   };

//   const handleEditLevel = (level) => {
//     setLevelInput(level.level);
//     setEditingId(level._id);
//     setIsEditing(true);
//     document.getElementById("levelInput")?.scrollIntoView({ behavior: "smooth" });
//   };

//   const confirmDelete = (level) => {
//     setLevelToDelete(level);
//     setShowDeleteModal(true);
//   };

//   const handleDeleteLevel = async () => {
//     if (!levelToDelete) return;
    
//     try {
//       const res = await fetch(`${BASE_URL}/api/admin/education-levels/${levelToDelete._id}`, {
//         method: "DELETE",
//       });
      
//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to delete education level");
//       }

//       const data = await res.json();
//       toast.success(data.message || "Education level deleted successfully");
//       fetchEducationLevels();
//     } catch (error) {
//       console.error("Error deleting education level:", error);
//       toast.error(
//         <div>
//           <p className="font-medium">Deletion Failed</p>
//           <p>{error.message || "Please try again"}</p>
//         </div>,
//         { autoClose: 5000 }
//       );
//     } finally {
//       setShowDeleteModal(false);
//       setLevelToDelete(null);
//     }
//   };

//   return (
//     <AdminLayout>
//       {/* Delete Confirmation Modal */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 max-w-md w-full">
//             <h3 className="text-lg font-medium text-gray-800 mb-4">Confirm Deletion</h3>
//             <p className="text-gray-600 mb-6">
//               Are you sure you want to delete <span className="font-semibold">"{levelToDelete?.level}"</span>? This action cannot be undone.
//             </p>
//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowDeleteModal(false)}
//                 className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDeleteLevel}
//                 className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="max-w-4xl mx-auto px-4 py-8">
//         {/* Page Header */}
//         <div className="mb-8">
//           <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
//           <p className="text-gray-600">Manage application security and education levels</p>
//         </div>

//         {/* OTP Settings Card */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h2 className="text-lg font-semibold text-gray-800">OTP Authentication</h2>
//               <p className="text-sm text-gray-500">
//                 {otpActive ? "OTP is currently required for login" : "OTP is currently optional"}
//               </p>
//             </div>
//             <button
//               onClick={toggleOtp}
//               disabled={loadingOtp}
//               className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
//                 otpActive ? 'bg-green-500' : 'bg-gray-300'
//               }`}
//             >
//               <span
//                 className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
//                   otpActive ? 'translate-x-6' : 'translate-x-1'
//                 }`}
//               />
//               <span className="sr-only">Toggle OTP</span>
//             </button>
//           </div>
//           <p className="text-sm text-gray-600">
//             {loadingOtp ? "Updating..." : "Toggle this switch to enable/disable OTP authentication for all users"}
//           </p>
//         </div>

//         {/* Education Levels Card */}
//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-semibold text-gray-800">Education Levels</h2>
//             <div className="relative w-64">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//               </div>
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 placeholder="Search levels..."
//                 className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//               />
//             </div>
//           </div>
          
//           {/* Add/Edit Form */}
//           <div className="flex gap-2 mb-6" id="levelInput">
//             <input
//               type="text"
//               value={levelInput}
//               onChange={(e) => setLevelInput(e.target.value)}
//               placeholder="Enter education level (e.g. Bachelor's Degree)"
//               className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//             <button
//               onClick={handleAddOrUpdateLevel}
//               disabled={!levelInput.trim()}
//               className={`px-4 py-2 rounded-md text-white ${
//                 !levelInput.trim() ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
//               }`}
//             >
//               {isEditing ? "Update Level" : "Add Level"}
//             </button>
//             {isEditing && (
//               <button
//                 onClick={() => {
//                   setIsEditing(false);
//                   setLevelInput("");
//                   setEditingId(null);
//                 }}
//                 className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
//               >
//                 Cancel
//               </button>
//             )}
//           </div>

//           {/* Levels Table */}
//           <div className="border border-gray-200 rounded-lg overflow-hidden">
//             {loadingLevels ? (
//               <div className="p-4 text-center text-gray-500">Loading education levels...</div>
//             ) : filteredLevels.length === 0 ? (
//               <div className="p-4 text-center text-gray-500">
//                 {searchTerm ? "No matching education levels found" : "No education levels added yet"}
//               </div>
//             ) : (
//               <div className="overflow-y-auto max-h-64">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50 sticky top-0">
//                     <tr>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Education Level
//                       </th>
//                       <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {filteredLevels.map((level) => (
//                       <tr key={level._id} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
//                           {level.level}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                           <button
//                             onClick={() => handleEditLevel(level)}
//                             className="text-blue-600 hover:text-blue-800 mr-4"
//                           >
//                             Edit
//                           </button>
//                           <button
//                             onClick={() => confirmDelete(level)}
//                             className="text-red-600 hover:text-red-800"
//                           >
//                             Delete
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </AdminLayout>
//   );
// };

// export default AdminSettings;
import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/components/AdminLayout";
import { BASE_URL } from "@/config";
import { toast } from "react-toastify";


const AdminSettings = () => {
  // State for OTP settings
  const [otpActive, setOtpActive] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  
  // State for tabs
  const [activeTab, setActiveTab] = useState('education');
  
  // State for education levels
  const [levelInput, setLevelInput] = useState("");
  const [educationLevels, setEducationLevels] = useState([]);
  const [filteredLevels, setFilteredLevels] = useState([]);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [levelToDelete, setLevelToDelete] = useState(null);

  // State for subjects
  const [subjectInput, setSubjectInput] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [subjectSearchTerm, setSubjectSearchTerm] = useState("");
  const [showSubjectDeleteModal, setShowSubjectDeleteModal] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchOtpStatus();
    fetchEducationLevels();
    fetchSubjects();
  }, []);

  // Filter education levels based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = educationLevels.filter(level =>
        level.level.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLevels(filtered);
    } else {
      setFilteredLevels(educationLevels);
    }
  }, [searchTerm, educationLevels]);

  // Filter subjects based on search term
  useEffect(() => {
    if (subjectSearchTerm) {
      const filtered = Array.isArray(subjects) ? subjects.filter(subject =>
        subject.name.toLowerCase().includes(subjectSearchTerm.toLowerCase())
      ) : [];
      setFilteredSubjects(filtered);
    } else {
      setFilteredSubjects(Array.isArray(subjects) ? subjects : []);
    }
  }, [subjectSearchTerm, subjects]);

  const fetchOtpStatus = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/rules/otp-status`);
      const data = await res.json();
      setOtpActive(data.data?.otp_rule_active || false);
    } catch (error) {
      console.error("Error fetching OTP status:", error);
      toast.error("Failed to fetch OTP status");
    }
  };

  const fetchEducationLevels = async () => {
    try {
      setLoadingLevels(true);
      const res = await fetch(`${BASE_URL}/api/admin/education-levels`);
      const data = await res.json();
      setEducationLevels(Array.isArray(data) ? data : []);
      setFilteredLevels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching education levels:", error);
      toast.error("Failed to fetch education levels");
    } finally {
      setLoadingLevels(false);
    }
  };


  const toggleOtp = async () => {
    try {
      setLoadingOtp(true);
      const res = await fetch(`${BASE_URL}/api/admin/rules/toggle-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setOtpActive(data.data?.otp_rule_active);
      toast.success(`OTP authentication is now ${data.data?.otp_rule_active ? "enabled" : "disabled"}`);
    } catch (error) {
      console.error("Error toggling OTP:", error);
      toast.error("Failed to toggle OTP setting");
    } finally {
      setLoadingOtp(false);
    }
  };

  // Education Level Functions
  const handleAddOrUpdateLevel = async () => {
    if (!levelInput.trim()) {
      toast.error("Please enter an education level");
      return;
    }

    try {
      if (isEditing && editingId) {
        const res = await fetch(`${BASE_URL}/api/admin/education-levels/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ level: levelInput }),
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to update education level");
        }

        const data = await res.json();
        toast.success(data.message || "Education level updated successfully");
      } else {
        const res = await fetch(`${BASE_URL}/api/admin/education-levels`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ level: levelInput }),
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to add education level");
        }

        const data = await res.json();
        toast.success(data.message || "Education level added successfully");
      }
      
      setLevelInput("");
      setEditingId(null);
      setIsEditing(false);
      fetchEducationLevels();
    } catch (error) {
      console.error("Error saving education level:", error);
      toast.error(
        <div>
          <p className="font-medium">Operation Failed</p>
          <p>{error.message || "Please try again"}</p>
        </div>,
        { autoClose: 5000 }
      );
    }
  };

  const handleEditLevel = (level) => {
    setLevelInput(level.level);
    setEditingId(level._id);
    setIsEditing(true);
    document.getElementById("levelInput")?.scrollIntoView({ behavior: "smooth" });
  };

  const confirmDelete = (level) => {
    setLevelToDelete(level);
    setShowDeleteModal(true);
  };

  const handleDeleteLevel = async () => {
    if (!levelToDelete) return;
    
    try {
      const res = await fetch(`${BASE_URL}/api/admin/education-levels/${levelToDelete._id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete education level");
      }

      const data = await res.json();
      toast.success(data.message || "Education level deleted successfully");
      fetchEducationLevels();
    } catch (error) {
      console.error("Error deleting education level:", error);
      toast.error(
        <div>
          <p className="font-medium">Deletion Failed</p>
          <p>{error.message || "Please try again"}</p>
        </div>,
        { autoClose: 5000 }
      );
    } finally {
      setShowDeleteModal(false);
      setLevelToDelete(null);
    }
  };

// In the fetchSubjects function, update the data handling:
const fetchSubjects = async () => {
  try {
    setLoadingSubjects(true);
    const res = await fetch(`${BASE_URL}/api/admin/subjects`);
    const data = await res.json();
    
    // Handle different response structures
    const subjectsData = Array.isArray(data) ? data : 
                        (Array.isArray(data.data) ? data.data : []);
    
    setSubjects(subjectsData);
    setFilteredSubjects(subjectsData);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    toast.error("Failed to fetch subjects");
  } finally {
    setLoadingSubjects(false);
  }
};

// In the handleAddOrUpdateSubject function, update the response handling:
const handleAddOrUpdateSubject = async () => {
  if (!subjectInput.trim()) {
    toast.error("Please enter a subject name");
    return;
  }

  try {
    if (isEditingSubject && editingSubjectId) {
      const res = await fetch(`${BASE_URL}/api/admin/subjects/${editingSubjectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: subjectInput }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update subject");
      }

      const data = await res.json();
      toast.success(data.message || "Subject updated successfully");
      
      // Update the subjects list with the updated subject
      setSubjects(prev => prev.map(sub => 
        sub._id === editingSubjectId ? { ...sub, name: subjectInput } : sub
      ));
    } else {
      const res = await fetch(`${BASE_URL}/api/admin/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: subjectInput }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add subject");
      }

      const data = await res.json();
      toast.success(data.message || "Subject added successfully");
      
      // Add the new subject to the list
      if (data.data) {
        setSubjects(prev => [...prev, data.data]);
      }
    }
    
    setSubjectInput("");
    setEditingSubjectId(null);
    setIsEditingSubject(false);
  } catch (error) {
    console.error("Error saving subject:", error);
    toast.error(
      <div>
        <p className="font-medium">Operation Failed</p>
        <p>{error.message || "Please try again"}</p>
      </div>,
      { autoClose: 5000 }
    );
  }
};

// In the handleDeleteSubject function, update the state update:
const handleDeleteSubject = async () => {
  if (!subjectToDelete) return;
  
  try {
    const res = await fetch(`${BASE_URL}/api/admin/subjects/${subjectToDelete._id}`, {
      method: "DELETE",
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to delete subject");
    }

    const data = await res.json();
    toast.success(data.message || "Subject deleted successfully");
    
    // Remove the deleted subject from the list
    setSubjects(prev => prev.filter(sub => sub._id !== subjectToDelete._id));
  } catch (error) {
    console.error("Error deleting subject:", error);
    toast.error(
      <div>
        <p className="font-medium">Deletion Failed</p>
        <p>{error.message || "Please try again"}</p>
      </div>,
      { autoClose: 5000 }
    );
  } finally {
    setShowSubjectDeleteModal(false);
    setSubjectToDelete(null);
  }
};

  const handleEditSubject = (subject) => {
    setSubjectInput(subject.name);
    setEditingSubjectId(subject._id);
    setIsEditingSubject(true);
    document.getElementById("subjectInput")?.scrollIntoView({ behavior: "smooth" });
  };

  const confirmSubjectDelete = (subject) => {
    setSubjectToDelete(subject);
    setShowSubjectDeleteModal(true);
  };


  return (
    <AdminLayout>
      {/* Delete Confirmation Modals */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">"{levelToDelete?.level}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLevel}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubjectDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">"{subjectToDelete?.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSubjectDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubject}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
          <p className="text-gray-600">Manage application security, education levels, and subjects</p>
        </div>

        {/* OTP Settings Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">OTP Authentication</h2>
              <p className="text-sm text-gray-500">
                {otpActive ? "OTP is currently required for login" : "OTP is currently optional"}
              </p>
            </div>
            <button
              onClick={toggleOtp}
              disabled={loadingOtp}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                otpActive ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  otpActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
              <span className="sr-only">Toggle OTP</span>
            </button>
          </div>
          <p className="text-sm text-gray-600">
            {loadingOtp ? "Updating..." : "Toggle this switch to enable/disable OTP authentication for all users"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'education' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('education')}
          >
            Education Levels
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'subjects' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('subjects')}
          >
            Subjects
          </button>
        </div>

        {/* Education Levels Card */}
        {activeTab === 'education' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Education Levels</h2>
              <div className="relative w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search levels..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            {/* Add/Edit Form */}
            <div className="flex gap-2 mb-6" id="levelInput">
              <input
                type="text"
                value={levelInput}
                onChange={(e) => setLevelInput(e.target.value)}
                placeholder="Enter education level (e.g. Bachelor's Degree)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleAddOrUpdateLevel}
                disabled={!levelInput.trim()}
                className={`px-4 py-2 rounded-md text-white ${
                  !levelInput.trim() ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isEditing ? "Update Level" : "Add Level"}
              </button>
              {isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setLevelInput("");
                    setEditingId(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Levels Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {loadingLevels ? (
                <div className="p-4 text-center text-gray-500">Loading education levels...</div>
              ) : filteredLevels.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? "No matching education levels found" : "No education levels added yet"}
                </div>
              ) : (
                <div className="overflow-y-auto max-h-64">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Education Level
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLevels.map((level) => (
                        <tr key={level._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {level.level}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditLevel(level)}
                              className="text-blue-600 hover:text-blue-800 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDelete(level)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subjects Card */}
        {activeTab === 'subjects' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Subjects</h2>
              <div className="relative w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={subjectSearchTerm}
                  onChange={(e) => setSubjectSearchTerm(e.target.value)}
                  placeholder="Search subjects..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            {/* Add/Edit Form */}
            <div className="flex gap-2 mb-6" id="subjectInput">
              <input
                type="text"
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                placeholder="Enter subject name (e.g. Mathematics)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleAddOrUpdateSubject}
                disabled={!subjectInput.trim()}
                className={`px-4 py-2 rounded-md text-white ${
                  !subjectInput.trim() ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isEditingSubject ? "Update Subject" : "Add Subject"}
              </button>
              {isEditingSubject && (
                <button
                  onClick={() => {
                    setIsEditingSubject(false);
                    setSubjectInput("");
                    setEditingSubjectId(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Subjects Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {loadingSubjects ? (
                <div className="p-4 text-center text-gray-500">Loading subjects...</div>
              ) : filteredSubjects.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {subjectSearchTerm ? "No matching subjects found" : "No subjects added yet"}
                </div>
              ) : (
                <div className="overflow-y-auto max-h-64">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSubjects.map((subject) => (
                        <tr key={subject._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {subject.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditSubject(subject)}
                              className="text-blue-600 hover:text-blue-800 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => confirmSubjectDelete(subject)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;