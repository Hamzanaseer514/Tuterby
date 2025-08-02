import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, BookCopy, CheckCircle, Sparkles } from 'lucide-react';
import { 
    gcseSubjectsList, 
    aLevelSubjectsList, 
    ibSubjectsList, 
    btecSubjectsList,
    undergraduateDegreeAreasList 
} from '@/data/subjectsPageData';

const SubjectsOverviewSection = () => {
  const uniqueSubjects = useMemo(() => {
    const getUniqueSubjectsSample = (list, coreKeywords, count, groupName) => {
      const selected = new Set();
      const result = [];
      
      for (const keyword of coreKeywords) {
        for (const subject of list) {
          if (subject.toLowerCase().includes(keyword.toLowerCase()) && !selected.has(subject.toLowerCase())) {
            selected.add(subject.toLowerCase());
            let displayName = subject.replace(/\s*\(Level 3 National Diploma\/Extended Diploma\)\s*|\s*\(Level 3\)\s*|\s*\(SL\/HL\)\s*/gi, "").trim();
            displayName = displayName.length > 25 ? displayName.substring(0, 22) + '...' : displayName;
            result.push({ name: displayName, group: groupName });
            if (result.length >= count) break;
          }
        }
        if (result.length >= count) break;
      }
      
      let i = 0;
      while(result.length < count && i < list.length) {
          const subject = list[i];
          if (!selected.has(subject.toLowerCase())) {
              selected.add(subject.toLowerCase());
              let displayName = subject.replace(/\s*\(Level 3 National Diploma\/Extended Diploma\)\s*|\s*\(Level 3\)\s*|\s*\(SL\/HL\)\s*/gi, "").trim();
              displayName = displayName.length > 25 ? displayName.substring(0, 22) + '...' : displayName;
              result.push({ name: displayName, group: groupName });
          }
          i++;
      }
      return result.slice(0, count);
    };

    const getUndergradSample = (count) => {
      const coreDegreeKeywords = [
          "Computer Science", "Software Engineering", "Business Administration", "Finance", "Accounting", 
          "Economics", "Law", "Cyber Security", "Artificial intelligence (AI)", "Data Science", 
          "Mechanical Engineering", "Project Management", "Supply Chain Management", "Psychology"
      ];
      const result = [];
      const selectedDegrees = new Set();

      for (const keyword of coreDegreeKeywords) {
          for (const area in undergraduateDegreeAreasList) {
              const foundDegree = undergraduateDegreeAreasList[area].modules.find(d => d.toLowerCase().includes(keyword.toLowerCase()));
              if (foundDegree && !selectedDegrees.has(foundDegree.toLowerCase())) {
                  selectedDegrees.add(foundDegree.toLowerCase());
                  result.push({ name: foundDegree.length > 22 ? foundDegree.substring(0, 19) + '...' : foundDegree, group: "UG Degrees" });
                  if (result.length >= count) return result;
              }
          }
      }
      
      for (const area in undergraduateDegreeAreasList) {
          for (const degree of undergraduateDegreeAreasList[area].modules) {
              if (result.length >= count) return result;
              if (!selectedDegrees.has(degree.toLowerCase())) {
                  selectedDegrees.add(degree.toLowerCase());
                  result.push({ name: degree.length > 22 ? degree.substring(0, 19) + '...' : degree, group: "UG Degrees" });
              }
          }
      }
      return result.slice(0, count);
    };

    const subjects = [
      ...getUniqueSubjectsSample(gcseSubjectsList, ["Mathematics", "English Language", "Physics", "Chemistry", "Biology", "Computer Science"], 3, "GCSE"),
      ...getUniqueSubjectsSample(aLevelSubjectsList, ["Mathematics", "Further Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "Economics"], 3, "A-Level"),
      ...getUniqueSubjectsSample(ibSubjectsList, ["Mathematics: Analysis & Approaches", "Physics", "Chemistry", "Biology", "Economics", "Business Management"], 2, "IB Core"),
      ...getUniqueSubjectsSample(btecSubjectsList, ["Business", "Engineering", "IT", "Applied Science", "Computing"], 2, "BTEC"),
      ...getUndergradSample(4)
    ];
    return Array.from(new Set(subjects.map(s => JSON.stringify(s)))).map(s => JSON.parse(s));
  }, []);


  const groupColors = {
    "GCSE": "border-blue-500/50 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 text-blue-700 dark:from-blue-900/50 dark:via-blue-800/50 dark:to-blue-700/50 dark:text-blue-300 dark:border-blue-600/70",
    "A-Level": "border-green-500/50 bg-gradient-to-br from-green-50 via-green-100 to-green-200 text-green-700 dark:from-green-900/50 dark:via-green-800/50 dark:to-green-700/50 dark:text-green-300 dark:border-green-600/70",
    "IB Core": "border-purple-500/50 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 text-purple-700 dark:from-purple-900/50 dark:via-purple-800/50 dark:to-purple-700/50 dark:text-purple-300 dark:border-purple-600/70",
    "BTEC": "border-orange-500/50 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 text-orange-700 dark:from-orange-900/50 dark:via-orange-800/50 dark:to-orange-700/50 dark:text-orange-300 dark:border-orange-600/70",
    "UG Degrees": "border-red-500/50 bg-gradient-to-br from-red-50 via-red-100 to-red-200 text-red-700 dark:from-red-900/50 dark:via-red-800/50 dark:to-red-700/50 dark:text-red-300 dark:border-red-600/70",
  };


  return (
    <section className="py-10 md:py-12 bg-muted dark:bg-slate-800/50 rounded-xl">
      <div className="container mx-auto px-4">
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6 md:mb-8"
        >
            <BookCopy className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-2" />
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Ignite Your Knowledge: <span className="gradient-text">Our Subject Universe</span>
            </h2>
            <p className="text-md md:text-lg text-muted-foreground max-w-3xl mx-auto">
                From foundational GCSEs to specialized Undergraduate degrees, we provide expert tutoring to forge your path across all key UK curricula including A-Levels, IB, and BTECs.
            </p>
        </motion.div>
        <div className="flex flex-wrap justify-center items-center gap-3 mb-8">
            {uniqueSubjects.map((subject, index) => (
            <motion.div
                key={`${subject.name}-${subject.group}-${index}`}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true, amount: 0.1 }}
            >
                <span 
                  className={`group inline-flex items-center py-2.5 px-5 rounded-lg text-xs sm:text-sm font-medium shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border ${groupColors[subject.group] || 'border-primary/50 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/20 text-primary dark:from-primary/20 dark:via-primary/30 dark:to-primary/40 dark:text-primary-foreground/80 dark:border-primary/70'}`}
                  title={`Tutoring available for ${subject.name} (${subject.group})`}
                >
                <Sparkles className="w-4 h-4 mr-2 opacity-70 group-hover:opacity-100 transition-opacity text-yellow-500" />
                {subject.name}
                </span>
            </motion.div>
            ))}
        </div>
        <div className="text-center">
            <Button size="lg" variant="default" asChild className="group btn-primary-hover">
            <Link to="/subjects" aria-label="Explore all subjects and academic levels offered">
                Explore All Subjects & Levels <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            </Button>
        </div>
      </div>
    </section>
  );
};

export default React.memo(SubjectsOverviewSection);