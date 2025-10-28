import React, { useState, useEffect, Suspense, lazy } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import SubjectLevelCard from "@/components/subjects/SubjectLevelCard";
import { levelsData } from "@/data/subjectsPageData";
import { useSubject } from "../hooks/useSubject";
import { BookCopy as PageIcon, Search, ArrowRight, X } from "lucide-react";
import SeoMetaTags from "@/components/SeoMetaTags";

const ExpandedLevelView = lazy(() =>
  import("@/components/subjects/ExpandedLevelView")
);

const PageLoader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const SubjectsPage = () => {
  const [expandedLevelId, setExpandedLevelId] = useState(null);
  const location = useLocation();
  const siteUrl = "https://www.tutornearby.co.uk";
  const { subjects } = useSubject();

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (hash) {
      const levelExists = levelsData.some((level) => level.id === hash);
      if (levelExists) {
        setExpandedLevelId(hash);
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    }
  }, [location.hash]);

  const handleExpandLevel = (levelId) => {
    setExpandedLevelId(levelId === expandedLevelId ? null : levelId);
    if (levelId !== expandedLevelId) {
      window.history.pushState(null, "", `#${levelId}`);
    } else {
      window.history.pushState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
  };

  const handleCloseExpandedView = () => {
    setExpandedLevelId(null);
    window.history.pushState(
      null,
      "",
      window.location.pathname + window.location.search
    );
  };

  const expandedLevelDataStatic = levelsData.find(
    (level) => level.id === expandedLevelId
  );

  const subjectsByLevelAndType = subjects.reduce((acc, subject) => {
    const levelId = subject.level_id?._id || "no-level";
    const typeId = subject.subject_type?._id || "no-type";

    if (!acc[levelId]) {
      acc[levelId] = {
        levelId,
        levelName: subject.level_id?.level || "No Level",
        types: {},
      };
    }

    if (!acc[levelId].types[typeId]) {
      acc[levelId].types[typeId] = {
        typeId,
        typeName: subject.subject_type?.name || "No Type",
        subjects: [],
      };
    }

    acc[levelId].types[typeId].subjects.push(subject);

    return acc;
  }, {});

  // Object to array conversion for mapping
  const subjectsByLevelArray = Object.values(subjectsByLevelAndType).map(
    (level) => ({
      ...level,
      types: Object.values(level.types),
    })
  );

  // Build a dynamic level object compatible with ExpandedLevelView when expanding backend-provided levels
  const expandedLevelDataDynamic = (() => {
    const levelGroup = subjectsByLevelArray.find(
      (l) => l.levelId === expandedLevelId
    );
    if (!levelGroup) return null;

    // De-duplicate subjects by stable database id
    const allSubjects = levelGroup.types.flatMap((t) => t.subjects || []);
    const seenSubjectIds = new Set();
    const uniqueSubjects = allSubjects.filter((s) => {
      const id = s._id || s.subject_id || s.id || s.name;
      if (seenSubjectIds.has(id)) return false;
      seenSubjectIds.add(id);
      return true;
    });

    const subjectsForView = uniqueSubjects.map((s) => ({
      id: s._id || s.subject_id || s.id || s.name,
      name: s.name,
      icon: null,
    }));

    // Build categories keyed uniquely by type id to avoid collisions when names repeat
    const categories = (() => {
      const acc = {};
      const usedKeys = new Set();
      for (const t of levelGroup.types) {
        const baseName = t.typeName || "Other";
        let key = baseName;
        let attempt = 2;
        while (usedKeys.has(key)) {
          key = `${baseName} #${attempt}`;
          attempt += 1;
        }
        usedKeys.add(key);
        acc[key] = (t.subjects || []).map((s) => ({
          id: s._id || s.subject_id || s.id || s.name,
          name: s.name,
        }));
      }
      return acc;
    })();

    return {
      id: levelGroup.levelId,
      name: levelGroup.levelName,
      description: `Explore ${levelGroup.levelName} subjects grouped by type.`,
      subjects: subjectsForView,
      categories,
      isPremiumService: false,
      icon: null,
    };
  })();

  const expandedLevelData = expandedLevelDataStatic || expandedLevelDataDynamic;

  console.log("Subjects by Level Array:", subjectsByLevelArray);

  const baseBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Subjects",
        item: `${siteUrl}/subjects`,
      },
    ],
  };

  let currentBreadcrumbSchema = baseBreadcrumb;
  if (expandedLevelData) {
    currentBreadcrumbSchema = {
      ...baseBreadcrumb,
      itemListElement: [
        ...baseBreadcrumb.itemListElement,
        {
          "@type": "ListItem",
          position: 3,
          name: expandedLevelData.name,
          item: `${siteUrl}/subjects#${expandedLevelData.id}`,
        },
      ],
    };
  }

  const pageTitle = expandedLevelData
    ? `${expandedLevelData.name} Tutoring | TutorNearby Subjects`
    : "Our Subjects & Levels - Expert Tutoring from GCSE to Undergraduate";
  const pageDescription = expandedLevelData
    ? `Explore ${
        expandedLevelData.name
      } subjects offered by TutorNearby. Expert tutors available for ${expandedLevelData.subjects
        .slice(0, 3)
        .map((s) => s.name)
        .join(", ")}, and more.`
    : "Explore our wide range of subjects for GCSE, A-Level, IB, BTEC, and Undergraduate studies. Find expert tutors in Maths, Science, English, Computing, Business, and more.";

  return (
    <>
      <SeoMetaTags
        title={pageTitle}
        description={pageDescription}
        keywords={`TutorNearby subjects, ${
          expandedLevelData ? expandedLevelData.name + " tutoring, " : ""
        }GCSE tutoring, A-Level tutoring, IB tutoring, BTEC tutoring, Undergraduate tutoring, Maths tutor, Science tutor, English tutor`}
        ogTitle={pageTitle}
        ogDescription={pageDescription}
        ogImage={`${siteUrl}/assets/og-images/subjects-og-image.png`}
        ogUrl={
          expandedLevelData ? `/subjects#${expandedLevelData.id}` : "/subjects"
        }
        canonicalUrl={
          expandedLevelData ? `/subjects#${expandedLevelData.id}` : "/subjects"
        }
        schemaMarkup={currentBreadcrumbSchema}
      />
      <div className="space-y-8 md:space-y-10 container mx-auto px-4 py-4">
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center pt-10 pb-6"
        >
          <PageIcon className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Our <span className="gradient-text">Subjects & Levels</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore the extensive range of subjects we offer across GCSE,
            A-Levels, BTECs, International Baccalaureate (IB), and Undergraduate
            studies.
          </p>
        </motion.section>

        {!expandedLevelId && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="py-8 px-6 md:px-6 bg-gradient-to-r from-primary/5 via-background to-primary/10 dark:from-primary/20 dark:via-slate-900 dark:to-primary/20 rounded-xl text-center shadow-lg border border-primary/20"
          >
            <Search className="w-12 h-12 text-primary mx-auto mb-3" />
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-primary"></h2>
            <p className="text-muted-foreground mb-6 max-w-3xl mx-auto text-md md:text-lg">
              We cover an extensive list of subjects and modules within GCSE,
              A-Levels, BTECs, IB, and various Undergraduate degrees including
              Software Engineering, AI, Cybersecurity, Data Science, Business,
              Accounting, Finance, Law, Economics, Statistics, and Research &
              Academic Skills. Click "View All Subjects" on a level below for a
              detailed breakdown.
            </p>
            <Button size="lg" asChild className="group btn-secondary-hover">
              <Link
                to="/contact"
                state={{ subjectQuery: "General Subject Enquiry" }}
                aria-label="Contact us with your subject request"
              >
                Contact Us With Your Subject Request
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.section>
        )}

        {expandedLevelData && (
          <motion.div
            id={expandedLevelData.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
            className="my-8"
          >
            <Suspense fallback={<PageLoader />}>
              <ExpandedLevelView
                level={expandedLevelData}
                onClose={handleCloseExpandedView}
              />
            </Suspense>
          </motion.div>
        )}

        {!expandedLevelId && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectsByLevelArray.map((levelGroup, index) => (
              <motion.div
                key={levelGroup.levelId}
                id={levelGroup.levelId}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true, amount: 0.2 }}
                // className="h-full"
              >
                <SubjectLevelCard
                  level={{
                    id: levelGroup.levelId,
                    levelName: levelGroup.levelName,
                    description: `Exploredddd ${levelGroup.levelName} subjects grouped by type.`,
                    subjects: (() => {
                      const all = levelGroup.types.flatMap((t) => t.subjects || []);
                      const seen = new Set();
                      return all.filter((s) => {
                        const id = s._id || s.subject_id || s.id || s.name;
                        if (seen.has(id)) return false;
                        seen.add(id);
                        return true;
                      });
                    })(),
                  }}
                  onExpand={() => handleExpandLevel(levelGroup.levelId)}
                  isExpanded={expandedLevelId === levelGroup.levelId}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* {expandedLevelId && (
          <div className="text-center mt-8">
            <Button
              onClick={handleCloseExpandedView}
              variant="outline"
              size="lg"
              className="group border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              aria-label="Close full list view"
            >
              <X className="mr-2 h-5 w-5" /> Close Full List
            </Button>
          </div>
        )} */}
      </div>
    </>
  );
};

export default SubjectsPage;
