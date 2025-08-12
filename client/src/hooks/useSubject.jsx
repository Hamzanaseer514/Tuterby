import { createContext, useContext, useState, useEffect } from "react";
import { BASE_URL } from "../config";

const SubjectContext = createContext();

export const SubjectProvider = ({ children }) => {
  const [subjects, setSubjects] = useState([]);
  const [academicLevels, setAcademicLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch both APIs
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/admin/subjects`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        console.log("Fetched subjects:", data.data);
        setSubjects(data.data);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };

    const fetchAcademicLevels = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/admin/education-levels`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        console.log("Fetched academic levels:", data);
        setAcademicLevels(data);
      } catch (err) {
        console.error("Error fetching academic levels:", err);
      }
    };

    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchSubjects(), fetchAcademicLevels()]);
      setLoading(false);
    };

    fetchAll();
  }, []);

  return (
    <SubjectContext.Provider
      value={{
        subjects,
        academicLevels,
        loading
      }}
    >
      {children}
    </SubjectContext.Provider>
  );
};

export const useSubject = () => useContext(SubjectContext);
