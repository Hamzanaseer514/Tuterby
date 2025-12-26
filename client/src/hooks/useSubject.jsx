import { createContext, useContext, useState, useEffect } from "react";
import { BASE_URL } from "../config";

const SubjectContext = createContext();

export const SubjectProvider = ({ children }) => {
  const [subjects, setSubjects] = useState([]);

  const [subjectRelatedToAcademicLevels, setSubjectRelatedToAcademicLevels] = useState([]);
  const [academicLevels, setAcademicLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch both APIs
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/admin/subjects`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setSubjects(data.data);
      } catch (err) {
        //console.error("Error fetching subjects:", err);
      }
    };

    const fetchAcademicLevels = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/admin/education-levels`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setAcademicLevels(data);
      } catch (err) {
        //console.error("Error fetching academic levels:", err);
      }
    };

    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchSubjects(), fetchAcademicLevels()]);
      setLoading(false);
    };

    fetchAll();
  }, []);

 const fetchSubjectRelatedToAcademicLevels = async (levelIds) => {
  try {
    // join all selected IDs with comma
    const query = levelIds.join(",");
    
    const res = await fetch(`${BASE_URL}/api/admin/levelsubjects?levels=${query}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    setSubjectRelatedToAcademicLevels(data.data);
  } catch (err) {
    //console.error("Error fetching subjects:", err);
  }
};


  return (
    <SubjectContext.Provider
      value={{
        subjects,
        academicLevels,
        loading,
        subjectRelatedToAcademicLevels,
        fetchSubjectRelatedToAcademicLevels,
        setSubjectRelatedToAcademicLevels
      }}
    >
      {children}
    </SubjectContext.Provider>
  );
};

export const useSubject = () => useContext(SubjectContext);
