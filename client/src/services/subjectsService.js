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
/*
// Previous implementation (flatten-first-12 unique)
// Kept here for reference only; do not uncomment unless you want to revert.
export const getSampleSubjects = async (maxPerLevel = 4) => {
  try {
    const allSubjects = await getSubjects();
    const MAX_TOTAL = 12;

    // Flatten all levels -> subjects, preserve original order
    const flat = [];
    Object.entries(allSubjects || {}).forEach(([levelName, arr]) => {
      (arr || []).forEach(subject => {
        flat.push({
          name: subject.name,
          group: levelName,
          id: subject.id,
          subjectType: subject.subjectType
        });
      });
    });

    // Take first 12 unique by name+group
    const seen = new Set();
    const picked = [];
    for (const item of flat) {
      const key = `${item.group}-${item.name}`;
      if (!seen.has(key)) {
        seen.add(key);
        picked.push(item);
        if (picked.length >= MAX_TOTAL) break;
      }
    }

    return picked;
  } catch (error) {
    throw error;
  }
};
*/
export const getSampleSubjects = async (maxPerLevel = 4) => {
  try {
    const allSubjects = await getSubjects();
    const sampleSubjects = [];
    const picked = new Set(); // avoid duplicates by name+group
    const MIN_TOTAL = 12;
    
    // Define level priorities for home page
    const levelPriority = ['GCSE', 'A-Level', 'BTEC', 'IB', 'Undergraduate'];
    
    // Pass 1: take up to maxPerLevel from each priority level
    levelPriority.forEach(levelName => {
      if (allSubjects[levelName] && sampleSubjects.length < MIN_TOTAL) {
        const levelSubjects = allSubjects[levelName].slice(0, maxPerLevel);
        levelSubjects.forEach(subject => {
          const key = `${levelName}-${subject.name}`;
          if (!picked.has(key) && sampleSubjects.length < MIN_TOTAL) {
            picked.add(key);
            sampleSubjects.push({
              name: subject.name,
              group: levelName,
              id: subject.id,
              subjectType: subject.subjectType
            });
          }
        });
      }
    });

    // Pass 2: if still fewer than MIN_TOTAL, take more from the same levels beyond maxPerLevel
    if (sampleSubjects.length < MIN_TOTAL) {
      levelPriority.forEach(levelName => {
        if (allSubjects[levelName] && sampleSubjects.length < MIN_TOTAL) {
          const levelSubjects = allSubjects[levelName].slice(maxPerLevel); // remaining
          levelSubjects.forEach(subject => {
            const key = `${levelName}-${subject.name}`;
            if (!picked.has(key) && sampleSubjects.length < MIN_TOTAL) {
              picked.add(key);
              sampleSubjects.push({
                name: subject.name,
                group: levelName,
                id: subject.id,
                subjectType: subject.subjectType
              });
            }
          });
        }
      });
    }

    // Pass 3: if still fewer, sweep all available levels (even if not in priority list)
    if (sampleSubjects.length < MIN_TOTAL) {
      Object.keys(allSubjects || {}).forEach(levelName => {
        if (sampleSubjects.length >= MIN_TOTAL) return;
        const arr = allSubjects[levelName] || [];
        arr.forEach(subject => {
          const key = `${levelName}-${subject.name}`;
          if (!picked.has(key) && sampleSubjects.length < MIN_TOTAL) {
            picked.add(key);
            sampleSubjects.push({
              name: subject.name,
              group: levelName,
              id: subject.id,
              subjectType: subject.subjectType
            });
          }
        });
      });
    }
    
    return sampleSubjects;
  } catch (error) {
    //console.error('Error fetching sample subjects:', error);
    throw error;
  }
};
