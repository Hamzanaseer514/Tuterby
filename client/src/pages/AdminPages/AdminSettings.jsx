import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/components/AdminLayout";
import { BASE_URL } from '@/config';
import { toast, ToastContainer } from "react-toastify";

const AdminSettings = () => {
  // State for OTP settings
  const [otpActive, setOtpActive] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);

  // State for tabs
  const [activeTab, setActiveTab] = useState("education");

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

  // State for education level management
  const [showManageModal, setShowManageModal] = useState(false);
  const [currentLevel, setCurrentLevel] = useState({
    id: null,
    level: "",
    hourlyRate: 0,
    totalSessionsPerMonth: 0,
    discount: 0,
    monthlyRate: 0,
    isTutorCanChangeRate: false,
    maxSession: 0,
    minSession: 0,
  });

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
  const [selectedLevel, setSelectedLevel] = useState("");
  // Add this near your other state declarations
  // const [subjectTypes] = useState([
  //   "humanities",
  //   "sciences",
  //   "arts",
  //   "languages",
  //   "mathematics",
  //   "social_sciences",
  //   "technical",
  //   "vocational",
  //   "physical_education",
  //   "others",
  // ]);
  const [selectedType, setSelectedType] = useState("");

  // States For Subject Types
  // Add these near your other state declarations
  const [subjectTypes, setSubjectTypes] = useState([]);
  const [subjectTypeInput, setSubjectTypeInput] = useState("");
  const [editingTypeId, setEditingTypeId] = useState(null);
  const [isEditingType, setIsEditingType] = useState(false);
  const [typeSearchTerm, setTypeSearchTerm] = useState("");
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [showTypeDeleteModal, setShowTypeDeleteModal] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState(null);

  // Column sorting states
  const [levelSortConfig, setLevelSortConfig] = useState({ key: null, direction: 'asc' });
  const [subjectSortConfig, setSubjectSortConfig] = useState({ key: null, direction: 'asc' });
  const [typeSortConfig, setTypeSortConfig] = useState({ key: null, direction: 'asc' });

  // Deletion dependency states
  const [levelDependencies, setLevelDependencies] = useState({ subjectCount: 0, sampleSubjects: [] });
  const [typeDependencies, setTypeDependencies] = useState({ subjectCount: 0, sampleSubjects: [] });

  // Fetch initial data
  useEffect(() => {
    fetchOtpStatus();
    fetchEducationLevels();
    fetchSubjects();
    fetchSubjectTypes(); // Add this line
  }, []);

  // Sort function
  const sortData = (data, sortConfig) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle nested properties
      if (sortConfig.key === 'level') {
        aValue = a.level;
        bValue = b.level;
      } else if (sortConfig.key === 'monthlyRate') {
        aValue = a.monthlyRate || 0;
        bValue = b.monthlyRate || 0;
      } else if (sortConfig.key === 'minSession') {
        aValue = a.minSession || 0;
        bValue = b.minSession || 0;
      } else if (sortConfig.key === 'maxSession') {
        aValue = a.maxSession || 0;
        bValue = b.maxSession || 0;
      }

      // Handle string comparison (case-insensitive)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Handle number comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }

      // Handle string comparison
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Filter education levels based on search term
  useEffect(() => {
    let filtered = educationLevels;

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter((level) =>
        level.level.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered = sortData(filtered, levelSortConfig);

    setFilteredLevels(filtered);
  }, [searchTerm, educationLevels, levelSortConfig]);

  // Sort subjects function
  const sortSubjects = (data, sortConfig) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let aValue, bValue;

      if (sortConfig.key === 'name') {
        aValue = a.name;
        bValue = b.name;
      } else if (sortConfig.key === 'level') {
        aValue = educationLevels.find(
          (l) => l._id === (a.level_id?._id || a.level)
        )?.level || "N/A";
        bValue = educationLevels.find(
          (l) => l._id === (b.level_id?._id || b.level)
        )?.level || "N/A";
      } else if (sortConfig.key === 'type') {
        aValue = subjectTypes.find(
          (type) => type._id === a.subject_type?._id
        )?.name || "N/A";
        bValue = subjectTypes.find(
          (type) => type._id === b.subject_type?._id
        )?.name || "N/A";
      }

      // Handle string comparison (case-insensitive)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Filter subjects based on search term
  useEffect(() => {
    let filtered = Array.isArray(subjects) ? subjects : [];

    // Apply search term filter
    if (subjectSearchTerm) {
      filtered = filtered.filter((subject) =>
        subject.name.toLowerCase().includes(subjectSearchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered = sortSubjects(filtered, subjectSortConfig);

    setFilteredSubjects(filtered);
  }, [subjectSearchTerm, subjects, subjectSortConfig, educationLevels, subjectTypes]);

  // Calculate monthly rate when hourly rate or sessions change
  useEffect(() => {
    if (showManageModal) {
      const monthlyRate =
        currentLevel.hourlyRate * currentLevel.totalSessionsPerMonth;
      const discountedRate = monthlyRate * (1 - currentLevel.discount / 100);
      setCurrentLevel((prev) => ({
        ...prev,
        monthlyRate: discountedRate,
      }));
    }
  }, [
    currentLevel.hourlyRate,
    currentLevel.totalSessionsPerMonth,
    currentLevel.discount,
    showManageModal,
  ]);

  const fetchOtpStatus = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/rules/otp-status`);
      const data = await res.json();
      setOtpActive(data.data?.otp_rule_active || false);
    } catch (error) {
      //console.error("Error fetching OTP status:", error);
      // toast.error("Failed to fetch OTP status");
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
      //console.error("Error fetching education levels:", error);
      // toast.error("Failed to fetch education levels");
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
      toast.success(
        `OTP authentication is now ${
          data.data?.otp_rule_active ? "enabled" : "disabled"
        }`
      );
    } catch (error) {
      //console.error("Error toggling OTP:", error);
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
        const res = await fetch(
          `${BASE_URL}/api/admin/education-levels/${editingId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ level: levelInput }),
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || "Failed to update education level"
          );
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
      //console.error("Error saving education level:", error);
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
    document
      .getElementById("levelInput")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const confirmDelete = (level) => {
    setLevelToDelete(level);
    // compute dependencies for this level
    try {
      const dependents = (Array.isArray(subjects) ? subjects : []).filter(
        (s) => (s.level_id?._id || s.level) === level._id
      );
      setLevelDependencies({
        subjectCount: dependents.length,
        sampleSubjects: dependents.slice(0, 5).map((s) => s.name),
      });
    } catch (e) {
      setLevelDependencies({ subjectCount: 0, sampleSubjects: [] });
    }
    setShowDeleteModal(true);
  };

  const handleDeleteLevel = async () => {
    if (!levelToDelete) return;

    try {
      const res = await fetch(
        `${BASE_URL}/api/admin/education-levels/${levelToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        const deps = errorData?.dependencies || {};
        const nonZero = Object.entries(deps).filter(([, v]) => v > 0);
        toast.error(
          <div>
            <p className="font-medium">{errorData.message || "Cannot delete education level"}</p>
            {nonZero.length > 0 && (
              <ul className="list-disc pl-5 mt-2 text-sm text-gray-700">
                {nonZero.map(([k, v]) => (
                  <li key={k}>{k.replace(/_/g, ' ')}: {v}</li>
                ))}
              </ul>
            )}
          </div>,
          { autoClose: 7000 }
        );
        return;
      }

      const data = await res.json();
      toast.success(data.message || "Education level deleted successfully");
      fetchEducationLevels();
    } catch (error) {
      //console.error("Error deleting education level:", error);
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
      setLevelDependencies({ subjectCount: 0, sampleSubjects: [] });
    }
  };

  // Manage Education Level Functions
  const openManageModal = (level) => {
    setCurrentLevel({
      id: level._id,
      level: level.level,
      hourlyRate: level.hourlyRate || 0,
      totalSessionsPerMonth: level.totalSessionsPerMonth || 0,
      discount: level.discount || 0,
      monthlyRate: level.monthlyRate || 0,
      isTutorCanChangeRate: level.isTutorCanChangeRate || false,
      maxSession: level.maxSession || 0,
      minSession: level.minSession || 0,
    });
    setShowManageModal(true);
  };

  const handleManageInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentLevel((prev) => ({
      ...prev,
      [name]:
        name === "discount"
          ? Math.min(100, Math.max(0, Number(value)))
          : Number(value),
    }));

    // Ensure maxSession is never less than minSession
    if (name === "minSession") {
      setCurrentLevel((prev) => ({
        ...prev,
        maxSession: Math.max(prev.maxSession, Number(value)),
      }));
    }
  };

  const saveManagedLevel = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/admin/education-levels/${currentLevel.id}/manage`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hourlyRate: currentLevel.hourlyRate,
            totalSessionsPerMonth: currentLevel.totalSessionsPerMonth,
            discount: currentLevel.discount,
            isTutorCanChangeRate: currentLevel.isTutorCanChangeRate,
            maxSession: currentLevel.maxSession,
            minSession: currentLevel.minSession,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || "Failed to update education level rates"
        );
      }

      const data = await res.json();
      toast.success(
        data.message || "Education level rates updated successfully"
      );
      fetchEducationLevels();
      setShowManageModal(false);
    } catch (error) {
      //console.error("Error updating education level rates:", error);
      toast.error(
        <div>
          <p className="font-medium">Update Failed</p>
          <p>{error.message || "Please try again"}</p>
        </div>,
        { autoClose: 5000 }
      );
    }
  };

  // Subjects Functions
  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const res = await fetch(`${BASE_URL}/api/admin/subjects`);
      const data = await res.json();

      const subjectsData = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : [];

      setSubjects(subjectsData);
      setFilteredSubjects(subjectsData);
    } catch (error) {
      //console.error("Error fetching subjects:", error);
      // toast.error("Failed to fetch subjects");
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleAddOrUpdateSubject = async () => {
    if (!subjectInput.trim() || !selectedLevel) {
      toast.error("Please enter a subject name and select a level");
      return;
    }

    try {
      if (isEditingSubject && editingSubjectId) {
        const res = await fetch(
          `${BASE_URL}/api/admin/subjects/${editingSubjectId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: subjectInput,
              level_id: selectedLevel,
              subject_type: selectedType,
            }),
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to update subject");
        }

        const data = await res.json();
        toast.success(data.message || "Subject updated successfully");
        setSubjects((prev) =>
          prev.map((sub) =>
            sub._id === editingSubjectId
              ? { ...sub, name: subjectInput, level: selectedLevel }
              : sub
          )
        );
      } else {
        const res = await fetch(`${BASE_URL}/api/admin/subjects`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: subjectInput,
            level_id: selectedLevel, // Changed from 'level' to 'level_id'
            subject_type: selectedType,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to add subject");
        }

        const data = await res.json();
        toast.success(data.message || "Subject added successfully");
        if (data.data) {
          setSubjects((prev) => [...prev, data.data]);
        }
      }

      setSubjectInput("");
      setSelectedLevel("");
      setSelectedType("");
      setEditingSubjectId(null);
      setIsEditingSubject(false);
      fetchSubjects();
    } catch (error) {
      //console.error("Error saving subject:", error);
      toast.error(
        <div>
          <p className="font-medium">Operation Failed</p>
          <p>{error.message || "Please try again"}</p>
        </div>,
        { autoClose: 5000 }
      );
    }
  };

  const handleDeleteSubject = async () => {
    if (!subjectToDelete) return;

    try {
      const res = await fetch(
        `${BASE_URL}/api/admin/subjects/${subjectToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        const deps = errorData?.dependencies || {};
        const nonZero = Object.entries(deps).filter(([, v]) => v > 0);
        toast.error(
          <div>
            <p className="font-medium">{errorData.message || "Cannot delete subject"}</p>
            {nonZero.length > 0 && (
              <ul className="list-disc pl-5 mt-2 text-sm text-gray-700">
                {nonZero.map(([k, v]) => (
                  <li key={k}>{k.replace(/_/g, ' ')}: {v}</li>
                ))}
              </ul>
            )}
          </div>,
          { autoClose: 7000 }
        );
        return;
      }

      const data = await res.json();
      toast.success(data.message || "Subject deleted successfully");
      setSubjects((prev) =>
        prev.filter((sub) => sub._id !== subjectToDelete._id)
      );
    } catch (error) {
      //console.error("Error deleting subject:", error);
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
    setSelectedLevel(subject.level_id); // Handle both cases
    setSelectedType(subject.subject_type || "");
    setEditingSubjectId(subject._id);
    setIsEditingSubject(true);
    document
      .getElementById("subjectInput")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const confirmSubjectDelete = (subject) => {
    setSubjectToDelete(subject);
    setShowSubjectDeleteModal(true);
  };

  // SUBJECT TYPES ALL FUNCTION
  // Fetch subject types from API
  const fetchSubjectTypes = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/subject-types`);
      const data = await res.json();
      const types = Array.isArray(data.data) ? data.data : [];
      setSubjectTypes(types);
      setFilteredTypes(types);
    } catch (error) {
      //console.error("Error fetching subject types:", error);
      // toast.error("Failed to fetch subject types");
    }
  };

  // Add or update subject type
  const handleAddOrUpdateType = async () => {
    if (!subjectTypeInput.trim()) {
      toast.error("Please enter a subject type name");
      return;
    }

    try {
      if (isEditingType && editingTypeId) {
        const res = await fetch(
          `${BASE_URL}/api/admin/subject-types/${editingTypeId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: subjectTypeInput }),
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to update subject type");
        }

        const data = await res.json();
        toast.success(data.message || "Subject type updated successfully");
        setSubjectTypes((prev) =>
          prev.map((type) =>
            type._id === editingTypeId
              ? { ...type, name: subjectTypeInput }
              : type
          )
        );
      } else {
        const res = await fetch(`${BASE_URL}/api/admin/subject-types`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: subjectTypeInput }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to add subject type");
        }

        const data = await res.json();
        toast.success(data.message || "Subject type added successfully");
        if (data.data) {
          setSubjectTypes((prev) => [...prev, data.data]);
        }
      }

      setSubjectTypeInput("");
      setEditingTypeId(null);
      setIsEditingType(false);
      fetchSubjectTypes();
    } catch (error) {
      //console.error("Error saving subject type:", error);
      toast.error(
        <div>
          <p className="font-medium">Operation Failed</p>
          <p>{error.message || "Please try again"}</p>
        </div>,
        { autoClose: 5000 }
      );
    }
  };

  // Edit subject type
  const handleEditType = (type) => {
    setSubjectTypeInput(type.name);
    setEditingTypeId(type._id);
    setIsEditingType(true);
    document
      .getElementById("typeInput")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // Delete subject type
  const handleDeleteType = async () => {
    if (!typeToDelete) return;

    try {
      const res = await fetch(
        `${BASE_URL}/api/admin/subject-types/${typeToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        const deps = errorData?.dependencies || {};
        const nonZero = Object.entries(deps).filter(([, v]) => v > 0);
        toast.error(
          <div>
            <p className="font-medium">{errorData.message || "Cannot delete subject type"}</p>
            {nonZero.length > 0 && (
              <ul className="list-disc pl-5 mt-2 text-sm text-gray-700">
                {nonZero.map(([k, v]) => (
                  <li key={k}>{k.replace(/_/g, ' ')}: {v}</li>
                ))}
              </ul>
            )}
          </div>,
          { autoClose: 7000 }
        );
        return;
      }

      const data = await res.json();
      toast.success(data.message || "Subject type deleted successfully");
      setSubjectTypes((prev) =>
        prev.filter((type) => type._id !== typeToDelete._id)
      );
    } catch (error) {
      //console.error("Error deleting subject type:", error);
      toast.error(
        <div>
          <p className="font-medium">Deletion Failed</p>
          <p>{error.message || "Please try again"}</p>
        </div>,
        { autoClose: 5000 }
      );
    } finally {
      setShowTypeDeleteModal(false);
      setTypeToDelete(null);
      setTypeDependencies({ subjectCount: 0, sampleSubjects: [] });
    }
  };

  // Confirm type delete with dependency computation
  const confirmTypeDelete = (type) => {
    setTypeToDelete(type);
    try {
      const dependents = (Array.isArray(subjects) ? subjects : []).filter(
        (s) => (s.subject_type?._id || s.subject_type) === type._id
      );
      setTypeDependencies({
        subjectCount: dependents.length,
        sampleSubjects: dependents.slice(0, 5).map((s) => s.name),
      });
    } catch (e) {
      setTypeDependencies({ subjectCount: 0, sampleSubjects: [] });
    }
    setShowTypeDeleteModal(true);
  };

  // Filter subject types based on search term
  useEffect(() => {
    let filtered = subjectTypes;

    // Apply search term filter
    if (typeSearchTerm) {
      filtered = filtered.filter((type) =>
        type.name.toLowerCase().includes(typeSearchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered = sortData(filtered, typeSortConfig);

    setFilteredTypes(filtered);
  }, [typeSearchTerm, subjectTypes, typeSortConfig]);

  // Sort handlers
  const handleLevelSort = (key) => {
    setLevelSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSubjectSort = (key) => {
    setSubjectSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleTypeSort = (key) => {
    setTypeSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Sort arrow component
  const SortArrow = ({ sortConfig, columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortConfig.direction === 'asc' ? 
      <span className="text-blue-600">↑</span> : 
      <span className="text-blue-600">↓</span>;
  };

  return (
    <>
      {/* Delete Confirmation Modals */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Confirm Deletion
            </h3>
            {levelDependencies.subjectCount > 0 ? (
              <div className="mb-6">
                <p className="text-red-600 font-medium">
                  Cannot delete. This education level has {levelDependencies.subjectCount} linked subject(s).
                </p>
                {levelDependencies.sampleSubjects.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Example subjects: {levelDependencies.sampleSubjects.join(", ")}
                    {levelDependencies.subjectCount > levelDependencies.sampleSubjects.length && " ..."}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">"{levelToDelete?.level}"</span>? This action cannot be undone.
              </p>
            )}
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

      {/* Manage Education Level Modal */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Manage {currentLevel.level}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={currentLevel.hourlyRate}
                  onChange={handleManageInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sessions Per Month
                </label>
                <input
                  type="number"
                  name="totalSessionsPerMonth"
                  value={currentLevel.totalSessionsPerMonth}
                  onChange={handleManageInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={currentLevel.discount}
                  onChange={handleManageInputChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700">
                  Monthly Rate:
                </p>
                <p className="text-xl font-semibold text-blue-600">
                  ${currentLevel.monthlyRate.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  (Calculated: ${currentLevel.hourlyRate} ×{" "}
                  {currentLevel.totalSessionsPerMonth} sessions = $
                  {(
                    currentLevel.hourlyRate * currentLevel.totalSessionsPerMonth
                  ).toFixed(2)}
                  )
                  {currentLevel.discount > 0 && (
                    <span> - {currentLevel.discount}% discount</span>
                  )}
                </p>
              </div>

              <div className="flex gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Sessions
                  </label>
                  <input
                    type="number"
                    name="minSession"
                    value={currentLevel.minSession}
                    onChange={handleManageInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Sessions
                  </label>
                  <input
                    type="number"
                    name="maxSession"
                    value={currentLevel.maxSession}
                    onChange={handleManageInputChange}
                    min={currentLevel.minSession} // Ensure max can't be less than min
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="tutorCanChangeRate"
                  name="isTutorCanChangeRate"
                  checked={currentLevel.isTutorCanChangeRate}
                  onChange={(e) =>
                    setCurrentLevel((prev) => ({
                      ...prev,
                      isTutorCanChangeRate: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="tutorCanChangeRate"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Allow tutors to change rates for this level
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowManageModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveManagedLevel}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubjectDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{subjectToDelete?.name}"</span>?
              This action cannot be undone.
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
      {/* Type Delete Confirmation Modal */}
      {showTypeDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Confirm Deletion
            </h3>
            {typeDependencies.subjectCount > 0 ? (
              <div className="mb-6">
                <p className="text-red-600 font-medium">
                  Cannot delete. This subject type has {typeDependencies.subjectCount} linked subject(s).
                </p>
                {typeDependencies.sampleSubjects.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Example subjects: {typeDependencies.sampleSubjects.join(", ")}
                    {typeDependencies.subjectCount > typeDependencies.sampleSubjects.length && " ..."}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">"{typeToDelete?.name}"</span>? This action cannot be undone.
              </p>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowTypeDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteType}
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
          <p className="text-gray-600">
            Manage application security, education levels, and subjects
          </p>
        </div>

        {/* OTP Settings Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                OTP Authentication
              </h2>
              <p className="text-sm text-gray-500">
                {otpActive
                  ? "OTP is currently required for login"
                  : "OTP is currently optional"}
              </p>
            </div>
            <button
              onClick={toggleOtp}
              disabled={loadingOtp}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                otpActive ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  otpActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
              <span className="sr-only">Toggle OTP</span>
            </button>
          </div>
          <p className="text-sm text-gray-600">
            {loadingOtp
              ? "Updating..."
              : "Toggle this switch to enable/disable OTP authentication for all users"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === "education"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("education")}
          >
            Education Levels
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === "subjects"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("subjects")}
          >
            Subjects
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === "subject-types"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("subject-types")}
          >
            Subject Types
          </button>
        </div>

        {/* Education Levels Card */}
        {activeTab === "education" && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Education Levels
              </h2>
              <div className="relative w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
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
                  !levelInput.trim()
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
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
                <div className="p-4 text-center text-gray-500">
                  Loading education levels...
                </div>
              ) : filteredLevels.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm
                    ? "No matching education levels found"
                    : "No education levels added yet"}
                </div>
              ) : (
                <div className="overflow-y-auto max-h-64">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleLevelSort('level')}
                        >
                          <div className="flex items-center justify-between">
                            Education Level
                            <SortArrow sortConfig={levelSortConfig} columnKey="level" />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleLevelSort('monthlyRate')}
                        >
                          <div className="flex items-center justify-between">
                            Monthly Rate
                            <SortArrow sortConfig={levelSortConfig} columnKey="monthlyRate" />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleLevelSort('minSession')}
                        >
                          <div className="flex items-center justify-between">
                            Minimum Sessions
                            <SortArrow sortConfig={levelSortConfig} columnKey="minSession" />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleLevelSort('maxSession')}
                        >
                          <div className="flex items-center justify-between">
                            Maximum Sessions
                            <SortArrow sortConfig={levelSortConfig} columnKey="maxSession" />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {level.monthlyRate
                              ? `$${level.monthlyRate.toFixed(2)}`
                              : "Not set"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {level.minSession}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {level.maxSession}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => openManageModal(level)}
                              className="text-green-600 hover:text-green-800 mr-4"
                            >
                              Manage
                            </button>
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
        {activeTab === "subjects" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Subjects</h2>
              <div className="relative w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
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
            {/* Add/Edit Form */}
            <div className="flex flex-col gap-4 mb-6" id="subjectInput">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  placeholder="Enter subject name (e.g. Mathematics)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Education Level</option>
                  {educationLevels.map((level) => (
                    <option key={level._id} value={level._id}>
                      {level.level}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className=" px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Subject Type</option>
                  {subjectTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.name.charAt(0).toUpperCase() +
                        type.name.slice(1).replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddOrUpdateSubject}
                  disabled={
                    !subjectInput.trim() || !selectedLevel || !selectedType
                  }
                  className={`px-4 py-2 rounded-md text-white ${
                    !subjectInput.trim() || !selectedLevel || !selectedType
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isEditingSubject ? "Update Subject" : "Add Subject"}
                </button>
                {isEditingSubject && (
                  <button
                    onClick={() => {
                      setIsEditingSubject(false);
                      setSubjectInput("");
                      setSelectedLevel("");
                      setSelectedType("");
                      setEditingSubjectId(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Subjects Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {loadingSubjects ? (
                <div className="p-4 text-center text-gray-500">
                  Loading subjects...
                </div>
              ) : filteredSubjects.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {subjectSearchTerm
                    ? "No matching subjects found"
                    : "No subjects added yet"}
                </div>
              ) : (
                <div className="overflow-y-auto max-h-64">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSubjectSort('name')}
                        >
                          <div className="flex items-center justify-between">
                            Subject Name
                            <SortArrow sortConfig={subjectSortConfig} columnKey="name" />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSubjectSort('level')}
                        >
                          <div className="flex items-center justify-between">
                            Education Level
                            <SortArrow sortConfig={subjectSortConfig} columnKey="level" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSubjectSort('type')}
                        >
                          <div className="flex items-center justify-between">
                            Type
                            <SortArrow sortConfig={subjectSortConfig} columnKey="type" />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {educationLevels.find(
                              (l) =>
                                l._id === (subject.level_id._id || subject.level)
                            )?.level || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {subjectTypes.find(
                              (type) => type._id === subject.subject_type._id
                            )?.name || "N/A"}
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

        {/* Subject Types Card */}
        {activeTab === "subject-types" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Subject Types
              </h2>
              <div className="relative w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={typeSearchTerm}
                  onChange={(e) => setTypeSearchTerm(e.target.value)}
                  placeholder="Search types..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Add/Edit Form */}
            <div className="flex gap-2 mb-6" id="typeInput">
              <input
                type="text"
                value={subjectTypeInput}
                onChange={(e) => setSubjectTypeInput(e.target.value)}
                placeholder="Enter subject type (e.g. Sciences)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleAddOrUpdateType}
                disabled={!subjectTypeInput.trim()}
                className={`px-4 py-2 rounded-md text-white ${
                  !subjectTypeInput.trim()
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isEditingType ? "Update Type" : "Add Type"}
              </button>
              {isEditingType && (
                <button
                  onClick={() => {
                    setIsEditingType(false);
                    setSubjectTypeInput("");
                    setEditingTypeId(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Types Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {subjectTypes.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {typeSearchTerm
                    ? "No matching subject types found"
                    : "No subject types added yet"}
                </div>
              ) : (
                <div className="overflow-y-auto max-h-64">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleTypeSort('name')}
                        >
                          <div className="flex items-center justify-between">
                            Subject Type
                            <SortArrow sortConfig={typeSortConfig} columnKey="name" />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTypes.map((type) => (
                        <tr key={type._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {type.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditType(type)}
                              className="text-blue-600 hover:text-blue-800 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => confirmTypeDelete(type)}
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
      <ToastContainer />
    </>
  );
};

export default AdminSettings;
