import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, BookCopy, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import { getSampleSubjects } from '@/services/subjectsService';

const SubjectsOverviewSection = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback hardcoded subjects in case API fails
  const fallbackSubjects = [
    { name: 'Mathematics', group: 'GCSE' },
    { name: 'English Language', group: 'GCSE' },
    { name: 'Physics', group: 'A-Level' },
    { name: 'Chemistry', group: 'A-Level' },
    { name: 'Business', group: 'BTEC' },
    { name: 'Engineering', group: 'BTEC' },
    { name: 'Software Engineering', group: 'Undergraduate' },
    { name: 'Financial Accounting', group: 'Undergraduate' },
    { name: 'Introduction to Psychology', group: 'Undergraduate' },
    { name: 'Principles of Management', group: 'Undergraduate' }
  ];

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const dynamicSubjects = await getSampleSubjects(12);
        setSubjects(dynamicSubjects);
      } catch (err) {
        console.error('Failed to fetch dynamic subjects, using fallback:', err);
        setError(err.message);
        setSubjects(fallbackSubjects);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const groupColors = {
    'GCSE': 'border-blue-200 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 text-blue-700 dark:from-blue-900/20 dark:via-blue-800/30 dark:to-blue-700/40 dark:text-blue-300 dark:border-blue-600',
    'A-Level': 'border-green-200 bg-gradient-to-br from-green-50 via-green-100 to-green-200 text-green-700 dark:from-green-900/20 dark:via-green-800/30 dark:to-green-700/40 dark:text-green-300 dark:border-green-600',
    'BTEC': 'border-purple-200 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 text-purple-700 dark:from-purple-900/20 dark:via-purple-800/30 dark:to-purple-700/40 dark:text-purple-300 dark:border-purple-600',
    'IB': 'border-orange-200 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 text-orange-700 dark:from-orange-900/20 dark:via-orange-800/30 dark:to-orange-700/40 dark:text-orange-300 dark:border-orange-600',
    'Undergraduate': 'border-red-200 bg-gradient-to-br from-red-50 via-red-100 to-red-200 text-red-700 dark:from-red-900/20 dark:via-red-800/30 dark:to-red-700/40 dark:text-red-300 dark:border-red-600'
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

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading subjects...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Using sample subjects. Dynamic content will be available soon.
            </p>
          </div>
        )}

        {/* Subjects Display */}
        {!loading && (
          <div className="flex flex-wrap justify-center items-center gap-3 mb-8">
            {subjects.map((subject, index) => (
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
                  {subject.name.length > 25 ? subject.name.substring(0, 22) + '...' : subject.name}
                  </span>
              </motion.div>
            ))}
          </div>
        )}

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