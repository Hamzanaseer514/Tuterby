import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ChevronRight,
  ExternalLink,
  ListChecks,
  BookOpen,
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
} from "lucide-react";

const isValidLucideIcon = (IconComponent) => {
  return (
    IconComponent &&
    (typeof IconComponent === "function" ||
      (typeof IconComponent === "object" &&
        IconComponent !== null &&
        typeof IconComponent.render === "function"))
  );
};

// Map subject name to an appropriate Lucide icon
const getSubjectIconForName = (subjectName) => {
  const n = (subjectName || "").toLowerCase();

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

const SubjectLevelCard = ({ level, onExpand, isExpanded, isHomePage }) => {
  if (!level) return null;
  const {
    name,
    level_id,
    levelName,
    icon: LevelIcon,
    description,
    coreSample,
    subjects,
    path,
    isPremiumService,
  } = level;
  const expandAriaLabel = isExpanded
    ? `Collapse full list for ${name}`
    : `Expand full ${
        isPremiumService ? "feature" : "subject"
      } list for ${name}`;
  const learnMoreAriaLabel = `Learn more about ${name} ${
    isPremiumService ? "programme" : "tutoring"
  }`;

  const displayedSubjects = [];
  if (coreSample && subjects) {
    coreSample.forEach((coreName) => {
      const coreSubject = subjects.find((s) =>
        s.name.toLowerCase().includes(coreName.toLowerCase())
      );
      if (coreSubject && displayedSubjects.length < 4) {
        displayedSubjects.push(coreSubject);
      }
    });

    let i = 0;
    while (displayedSubjects.length < 4 && i < subjects.length) {
      if (!displayedSubjects.find((ds) => ds.name === subjects[i].name)) {
        displayedSubjects.push(subjects[i]);
      }
      i++;
    }
  } else if (subjects) {
    displayedSubjects.push(...subjects.slice(0, 4));
  }

  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] },
    },
    hover: {
      y: -5,
      boxShadow: "0px 15px 30px -10px hsla(var(--primary), 0.25)",
      transition: { duration: 0.3, ease: "circOut" },
    },
  };

  const headerIcon = isValidLucideIcon(LevelIcon)
    ? LevelIcon
    : name === "Undergraduate"
    ? BookOpen
    : ListChecks;

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="h-full"
    >
      <Card className="h-full flex flex-col  bg-card/80 dark:bg-card/90 backdrop-blur-sm border-2 border-primary/10 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader
          className="px-4 py-2 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 dark:from-primary/10 dark:to-secondary/10"
          style={{ minHeight: "220px" }}
        >
          <div className="items-start mb-3">
            {isValidLucideIcon(headerIcon) && (
              <headerIcon className="w-12 h-12 text-primary shrink-0 mr-4" />
            )}
            <CardTitle className="text-xl md:text-2xl lg:text-3xl font-bold gradient-text text-center flex-grow">
              {levelName}
            </CardTitle>
          </div>
          <CardDescription
            className="text-[15px] py-6 md:py-8 text-center text-muted-foreground text-justify leading-relaxed overflow-hidden"
            // style={{
            //   display: "-webkit-box",
            //   WebkitLineClamp: 2,
            //   WebkitBoxOrient: "vertical",
            //   minHeight: "4.28rem", // ~2 lines with relaxed leading
            // }}
          >
            {description || ""}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 flex-grow">
          <p className="text-md font-semibold text-foreground/90 mb-4">
            {isPremiumService
              ? "Key Features Include:"
              : "Popular Subjects/Modules:"}
          </p>
          <ul className="space-y-2">
            {displayedSubjects.map((subject, index) => {
              const SubjectIcon = subject.icon || getSubjectIconForName(subject.name);
              return (
                <li
                  key={index}
                  className="flex items-center text-[15px] md:text-[16px] text-black dark:text-slate-300"
                >
                  {isValidLucideIcon(SubjectIcon) && (
                    <SubjectIcon
                      className={`w-4 h-4 mr-2.5 ${
                        isPremiumService ? "text-secondary" : "text-primary"
                      }`}
                    />
                  )}
                  <span>{subject.name}</span>
                  {isPremiumService && subject.blogSlug && (
                    <Link
                      to={`/blog/${subject.blogSlug}`}
                      aria-label={`Learn more about ${subject.name} in our blog`}
                      className="ml-auto p-1 rounded-full hover:bg-primary/10"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-primary/70 hover:text-primary transition-colors" />
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>

        <CardFooter className="p-5 bg-muted/30 dark:bg-slate-800/30 mt-auto">
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              onClick={() => onExpand(level.id)}
              variant="outline"
              className="w-full sm:w-auto group border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm hover:shadow-md"
              aria-label={expandAriaLabel}
            >
              {isExpanded
                ? "Show Less"
                : isPremiumService
                ? "Explore All Features"
                : "View All Subjects"}
              <ChevronRight
                className={`ml-2 h-4 w-4 transition-transform duration-300 ${
                  isExpanded ? "rotate-90" : ""
                } group-hover:translate-x-0.5`}
              />
            </Button>
            {!isHomePage && level.path && (
              <Button
                asChild
                variant="ghost"
                className="w-full sm:w-auto text-primary hover:bg-primary/10 hover:text-primary"
              >
                <Link to={level.path} aria-label={learnMoreAriaLabel}>
                  {isPremiumService ? "Programme Details" : "Learn More"}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default SubjectLevelCard;
