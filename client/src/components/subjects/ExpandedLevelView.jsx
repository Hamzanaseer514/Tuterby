import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  X,
  ListChecks,
  BookOpen,
  ExternalLink,
  Calculator,
  Sigma,
  Atom,
  FlaskConical,
  Microscope,
  Dna,
  Globe,
  Languages,
  Code2,
  Cpu,
  Brain,
  BarChart3,
  TrendingUp,
  Landmark,
  Gavel,
  Music2,
  Palette,
  Book,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const isValidLucideIcon = (IconComponent) => {
  return IconComponent && (typeof IconComponent === 'function' || (typeof IconComponent === 'object' && IconComponent !== null && typeof IconComponent.render === 'function'));
};

// Map subject name to an appropriate icon
const getSubjectIconForName = (subjectName) => {
  const n = (subjectName || '').toLowerCase();
  if (/psychology|neuro|cognitive/.test(n)) return Brain;
  if (/programming|coding|python|java|javascript|comput(er|ing)|software|cs|ai|ml|machine\s*learning/.test(n)) return Code2;
  if (/data\s*science|data\s*analysis|sql|database/.test(n)) return Cpu;
  if (/math|algebra|calculus|geometry|trigonometry|number|arithmetic/.test(n)) return Calculator;
  if (/statistics|probab|stat/.test(n)) return Sigma;
  if (/physics|mechanics|quantum|electromagnet|astronomy|astrophysics|atom/.test(n)) return Atom;
  if (/chem(istry)?|organic|inorganic|lab/.test(n)) return FlaskConical;
  if (/biology|life\s*science|anatomy|physiology|genetic/.test(n)) return Dna;
  if (/microbiology|microscope|cell/.test(n)) return Microscope;
  if (/geograph|earth|map|geo/.test(n)) return Globe;
  if (/history|civilization|ancient|world\s*history/.test(n)) return Landmark;
  if (/economics|finance|accounting|business|management|commerce/.test(n)) return TrendingUp;
  if (/marketing|brand|advertis|seo|sem|growth/.test(n)) return BarChart3;
  if (/law|legal|juris|contract/.test(n)) return Gavel;
  if (/english|literature|reading|writing|grammar|poetry|novel/.test(n)) return BookOpen;
  if (/language|french|spanish|german|urdu|arabic|mandarin|hindi/.test(n)) return Languages;
  if (/art|design|drawing|painting|sketch/.test(n)) return Palette;
  if (/music|song|guitar|piano/.test(n)) return Music2;
  return Book;
};

const SubjectChip = ({ subject, isPremiumFeature = false }) => {
  // const IconComponent = subject.icon 
  const IconComponent = subject.icon || getSubjectIconForName(subject.name);
  const linkAriaLabel = `Learn more about ${subject.name} in our blog`;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground/80 p-2.5 rounded-lg shadow-sm hover:shadow-md hover:bg-primary/20 dark:hover:bg-primary/30 transition-all duration-200 cursor-default"
    >
      <div className="flex items-center">
          {isValidLucideIcon(IconComponent) && (
            <IconComponent className="w-5 h-5 md:w-6 md:h-6 mr-2 text-primary" />
          )}
          <span className="text-[15px] md:text-[16px] font-medium text-foreground dark:text-slate-200">{subject.name}</span>
      </div>
      {isPremiumFeature && subject.blogSlug && (
          <Link to={`/blog/${subject.blogSlug}`} title={`Learn more about ${subject.name}`} className="ml-2 p-1 rounded-full hover:bg-primary/20" aria-label={linkAriaLabel}>
              <ExternalLink className="w-4 h-4 text-primary/80 hover:text-primary transition-colors" />
          </Link>
      )}
    </motion.div>
  );
};

const CategorySection = ({ categoryName, subjects, categoryIcon, isPremiumService }) => {
  const IconToRender = isValidLucideIcon(categoryIcon) ? categoryIcon : ListChecks; 
  
  return (
    <motion.div 
      className="mb-8 p-6 rounded-xl shadow-xl bg-card border border-border/30 glassmorphism"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <CardHeader className="p-0 mb-4 flex flex-row items-center space-x-3">
        {isValidLucideIcon(IconToRender) && <IconToRender className="w-7 h-7 text-secondary"/>}
        <CardTitle className="text-2xl md:text-3xl font-semibold gradient-text">{categoryName}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {subjects.map((subject, index) => (
          <SubjectChip key={`${categoryName}-${subject.name}-${index}`} subject={subject} isPremiumFeature={isPremiumService} />
        ))}
      </CardContent>
    </motion.div>
  );
};

const ExpandedLevelView = ({ level, onClose }) => {
  if (!level) return null;

  const { name, icon: LevelIcon, description, categories, subjects: allSubjectsWithIcons, isPremiumService } = level;
  const closeAriaLabel = `Close full list view for ${name}`;

  return (
    <motion.div 
      className="my-8 p-4 md:p-8 rounded-2xl shadow-2xl bg-gradient-to-br from-background via-slate-50 to-secondary/5 dark:from-slate-900 dark:via-slate-800 dark:to-secondary/10 border-2 border-primary/30 relative"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "circOut" }}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full z-10"
        onClick={onClose}
        aria-label={closeAriaLabel}
      >
        <X className="w-6 h-6" />
      </Button>

      <div className="text-center mb-7">
        {isValidLucideIcon(LevelIcon) && <LevelIcon className="w-20 h-20 text-primary mx-auto mb-3" />}
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-foreground">
          Full {isPremiumService ? "Feature" : "Subject"} List for <span className="gradient-text">{name}</span>
        </h1>
        <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
      </div>

      {name === "Undergraduate" && typeof categories === 'object' && categories !== null ? (
        Object.entries(categories).map(([degreeArea, dataObject]) => { 
          const areaSubjects = allSubjectsWithIcons.filter(s => s.category === degreeArea);
          if (areaSubjects.length === 0) return null;
          
          let CategoryIconForUG = BookOpen; 
          if (typeof dataObject === 'object' && dataObject !== null && isValidLucideIcon(dataObject.icon)) {
             CategoryIconForUG = dataObject.icon; }
          return (
             <CategorySection 
                key={degreeArea} 
                categoryName={degreeArea} 
                subjects={areaSubjects} 
                categoryIcon={CategoryIconForUG}
                isPremiumService={isPremiumService}
             />
          );
        })
      ) : categories && typeof categories === 'object' ? (
        Object.entries(categories).map(([categoryName, subjectList]) => {
            let categorySubjects = [];
            if (Array.isArray(subjectList)) {
              // Support either array of names or array of objects with ids
              const isObjectArray = subjectList.length > 0 && typeof subjectList[0] === 'object';
              if (isObjectArray) {
                const allowedIds = new Set(subjectList.map(x => x.id || x._id || x.subject_id || x.name));
                categorySubjects = allSubjectsWithIcons.filter(s => allowedIds.has(s.id || s._id || s.subject_id || s.name));
              } else {
                const allowedNames = new Set(subjectList);
                categorySubjects = allSubjectsWithIcons.filter(s => allowedNames.has(s.name));
              } }

            if (categorySubjects.length === 0) return null;
            // De-duplicate subjects within category by stable id or name
            const seen = new Set();
            categorySubjects = categorySubjects.filter(s => {
              const key = s.id || s._id || s.subject_id || s.name;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });

            return (
              <CategorySection 
                  key={categoryName} 
                  categoryName={categoryName} 
                  subjects={categorySubjects}
                  categoryIcon={ListChecks} 
                  isPremiumService={isPremiumService}
              />
            );
        })
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allSubjectsWithIcons.map((subject, index) => (
            <SubjectChip key={`${name}-${subject.name}-${index}`} subject={subject} isPremiumFeature={isPremiumService} />
          ))}
        </div>
      )}
      
      <div className="mt-8 text-center">
        <Button onClick={onClose} variant="outline" size="lg" className="group border-primary text-primary hover:bg-primary hover:text-primary-foreground" aria-label={closeAriaLabel}>
          <X className="mr-2 h-5 w-5" /> Close Full List
        </Button>
      </div>
    </motion.div>
  );
};

export default ExpandedLevelView;