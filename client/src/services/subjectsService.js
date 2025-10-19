// services/subjectsService.js
import { BASE_URL } from '@/config';

const API_BASE_URL = `${BASE_URL}/api/public`;
// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      //console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    //console.error('API call failed:', error);
    throw error;
  }
};

// Get all subjects grouped by education level
export const getSubjects = async () => {
  try {
    const response = await apiCall('/subjects');
    return response.data;
  } catch (error) {
    //console.error('Error fetching subjects:', error);
    throw error;
  }
};

// Get subjects for a specific education level
export const getSubjectsByLevel = async (levelName) => {
  try {
    const allSubjects = await getSubjects();
    return allSubjects[levelName] || [];
  } catch (error) {
    //console.error(`Error fetching subjects for level ${levelName}:`, error);
    throw error;
  }
};

// Get sample subjects for home page display
export const getSampleSubjects = async (maxPerLevel = 4) => {
  try {
    const allSubjects = await getSubjects();
    const sampleSubjects = [];
    
    // Define level priorities for home page
    const levelPriority = ['GCSE', 'A-Level', 'BTEC', 'IB', 'Undergraduate'];
    
    levelPriority.forEach(levelName => {
      if (allSubjects[levelName] && sampleSubjects.length < 12) {
        const levelSubjects = allSubjects[levelName].slice(0, maxPerLevel);
        levelSubjects.forEach(subject => {
          sampleSubjects.push({
            name: subject.name,
            group: levelName,
            id: subject.id,
            subjectType: subject.subjectType
          });
        });
      }
    });
    
    return sampleSubjects;
  } catch (error) {
    //console.error('Error fetching sample subjects:', error);
    throw error;
  }
};
