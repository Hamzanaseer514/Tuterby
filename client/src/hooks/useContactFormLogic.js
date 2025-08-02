import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import useLocalStorage from '@/hooks/useLocalStorage';
import { subjectsByLevel, planTypes } from '@/data/contactFormData';

const generateMathQuestion = () => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  return { num1, num2, answer: num1 + num2 };
};

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  selectedPlan: '',
  level: '',
  subject: '',
  preferredDays: [],
  hoursPerWeek: '',
  message: '',
  honeypot: '', 
  tutoringPreference: '',
  isNotRobot: false, 
  formLoadTime: Date.now(),
  mathCaptcha: '',
};

const useContactFormLogic = () => {
  const location = useLocation();
  const [mathQuestion, setMathQuestion] = useState(generateMathQuestion());
  const [formData, setFormData] = useLocalStorage('contactFormData', {
    ...initialFormData,
    formLoadTime: Date.now() 
  });
  const [selectedLevel, setSelectedLevel] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState([]);

  const updateFormData = useCallback((newValues) => {
    setFormData(prev => ({ ...prev, ...newValues }));
  }, [setFormData]);

  useEffect(() => {
    let prefilledLevel = ''; 
    let prefilledMessage = ''; 
    let prefilledPlan = '';
    
    const currentStoredData = JSON.parse(localStorage.getItem('contactFormData')) || {};

    if (location.state) {
      if (location.state.level) {
        prefilledLevel = location.state.level;
      }

      if (location.state.selectedPackage) {
        const packageLevelMapping = {
          'Foundational Levels': 'GCSE / O-Level',
          'Advanced Levels': 'A-Level / AS-Level',
          'Higher Education & IB': 'Undergraduate Degree',
          'Primary & Secondary Hourly': 'Secondary Level (KS3)',
          'Silver Family Royalty': '', 
          'Gold Family Royalty': '',
          'UG Silver Royalty': 'Undergraduate Degree',
          'UG Gold Royalty': 'Undergraduate Degree',
        };
        const levelFromPackage = packageLevelMapping[location.state.selectedPackage];
        if (levelFromPackage !== undefined) { 
          prefilledLevel = levelFromPackage;
        }
        
        if (planTypes.includes(location.state.selectedPackage)){
          prefilledPlan = location.state.selectedPackage;
        } else if(location.state.type?.startsWith('hourly')) {
          prefilledPlan = location.state.selectedPackage.includes('Primary') ? 'Primary & Secondary Hourly' :
                          location.state.selectedPackage.includes('Foundational') ? 'Foundational Levels Hourly' :
                          location.state.selectedPackage.includes('Advanced') ? 'Advanced Levels Hourly' :
                          'Higher Ed & IB Hourly';
        }
        prefilledMessage = `I'm interested in the ${location.state.selectedPackage} package. `;
      }
      
      if (location.state.customHours) {
          prefilledMessage = `I'm interested in a custom package of approximately ${location.state.customHours} hours per month, with an estimated cost around £${location.state.customPrice}. `;
          prefilledPlan = 'Custom Plan Enquiry';
      }

      if (location.state.enquiryType === "Membership") {
        prefilledMessage = `I'm interested in the annual membership discount. Please provide more details. `;
      }
      if (location.state.enquiryLocation) {
         prefilledMessage = `I'm interested in finding a tutor in ${location.state.enquiryLocation}. `;
      }
       if (location.state.subjectQuery) {
        prefilledMessage = `I have an enquiry about the ${location.state.subjectQuery}. `;
      }
      
      updateFormData({ 
        ...currentStoredData,
        level: prefilledLevel || currentStoredData.level || '', 
        message: prefilledMessage.trim(), 
        selectedPlan: prefilledPlan || currentStoredData.selectedPlan || '',
        formLoadTime: Date.now() 
      });
      setSelectedLevel(prefilledLevel || currentStoredData.level || '');

    } else {
      updateFormData({
        ...currentStoredData,
        message: '', 
        level: currentStoredData.level || '', 
        selectedPlan: currentStoredData.selectedPlan || '',
        formLoadTime: Date.now()
      });
      setSelectedLevel(currentStoredData.level || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, setFormData]); 
  
  useEffect(() => {
    if (selectedLevel) {
      let currentSubjects = subjectsByLevel[selectedLevel] || [];
      setAvailableSubjects(currentSubjects);
      
      if (!currentSubjects.includes(formData.subject)) {
        updateFormData({ subject: '' });
      }
    } else {
      setAvailableSubjects([]);
      updateFormData({ subject: '' });
    }
  }, [selectedLevel, formData.subject, updateFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleCheckboxChange = (day) => {
    updateFormData({
      preferredDays: formData.preferredDays.includes(day)
        ? formData.preferredDays.filter(d => d !== day)
        : [...formData.preferredDays, day]
    });
  };

  const handleRobotCheckboxChange = (checked) => {
    updateFormData({ isNotRobot: checked });
  };
  
  const handleSelectChange = (name, value) => {
    if (name === 'level') {
      setSelectedLevel(value);
    }
    updateFormData({ [name]: value });
  };

  const resetForm = useCallback(() => {
      setMathQuestion(generateMathQuestion());
      
      let messageToKeep = '';
      let planToKeep = '';
      let levelToKeep = '';

      if (location.state?.selectedPackage) {
        messageToKeep = `I'm interested in the ${location.state.selectedPackage} package. `;
        planToKeep = location.state.selectedPackage;
         const packageLevelMapping = {
          'Foundational Levels': 'GCSE / O-Level',
          'Advanced Levels': 'A-Level / AS-Level',
          'Higher Education & IB': 'Undergraduate Degree',
          'Primary & Secondary Hourly': 'Secondary Level (KS3)',
        };
        levelToKeep = packageLevelMapping[location.state.selectedPackage] || '';

      } else if (location.state?.customHours) {
        messageToKeep = `I'm interested in a custom package of approximately ${location.state.customHours} hours per month, with an estimated cost around £${location.state.customPrice}. `;
        planToKeep = 'Custom Plan Enquiry';
      } else if (location.state?.enquiryType === "Membership") {
        messageToKeep = `I'm interested in the annual membership discount. Please provide more details. `;
      } else if (location.state?.enquiryLocation) {
        messageToKeep = `I'm interested in finding a tutor in ${location.state.enquiryLocation}. `;
      } else if (location.state?.subjectQuery) {
        messageToKeep = `I have an enquiry about the ${location.state.subjectQuery}. `;
      }
      
      setFormData({
        ...initialFormData,
        formLoadTime: Date.now(),
        message: messageToKeep,
        selectedPlan: planToKeep,
        level: levelToKeep,
        mathCaptcha: '',
      });

      setSelectedLevel(levelToKeep || '');

  }, [location.state, setFormData]);

  return {
    formData,
    handleChange,
    handleCheckboxChange,
    handleSelectChange,
    selectedLevel,
    availableSubjects,
    resetForm,
    handleRobotCheckboxChange,
    mathQuestion,
    setMathQuestion, 
    generateMathQuestionFunc: generateMathQuestion 
  };
};

export default useContactFormLogic;