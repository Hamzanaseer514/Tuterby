import React from 'react';
import { motion } from 'framer-motion';
import { Users, Brain, Zap, Star, ShieldCheck, Target, BookOpenText, TrendingUp, Sparkles } from 'lucide-react';

const featuresData = [
  {
    icon: <Users className="w-10 h-10 text-primary mb-2" />,
    title: "Elite UK Tutors",
    description: "Handpicked from top universities, our tutors are subject experts dedicated to igniting your brilliance.",
  },
  {
    icon: <Brain className="w-10 h-10 text-primary mb-2" />,
    title: "Personalized Learning Paths",
    description: "Tailored lesson plans and teaching styles to match your unique needs, forging your path to success.",
  },
  {
    icon: <TrendingUp className="w-10 h-10 text-primary mb-2" />,
    title: "Proven Results, Brighter Futures",
    description: "Our students consistently achieve higher grades and greater confidence, opening doors to new opportunities.",
  },
  {
    icon: <ShieldCheck className="w-10 h-10 text-primary mb-2" />,
    title: "Safe & Inspiring Environment",
    description: "All tutors are DBS checked, ensuring a secure and supportive space for brilliance to flourish.",
  },
  {
    icon: <Zap className="w-10 h-10 text-primary mb-2" />,
    title: "Flexible & Accessible",
    description: "Online & in-person options designed to fit your lifestyle, making learning convenient.",
  },
  {
    icon: <BookOpenText className="w-10 h-10 text-primary mb-2" />,
    title: "Comprehensive Curriculum Mastery",
    description: "Expertise across GCSE, A-Level, IB, BTEC, and Undergraduate levels for all major subjects.",
  },
];

const FeaturesSection = () => {
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className=" bg-background dark:bg-slate-900/50">
      <div className="container mx-auto px-2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 md:mb-8"
        >
          <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-2" />
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Why <span className="gradient-text">TutorNearby</span> Ignites Brilliance
          </h2>
          <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto">
            We're committed to providing exceptional tutoring that not only teaches but inspires and transforms.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {featuresData.map((feature, index) => (
            <motion.div
              key={index}
              className="p-5 rounded-xl shadow-lg border border-border/70 flex flex-col text-center items-center bg-gradient-to-br from-card via-muted/10 to-card dark:from-slate-800/60 dark:via-slate-700/30 dark:to-slate-800/60 card-hover-effect"
              variants={itemVariants}
            >
              {feature.icon}
              <h3 className="text-lg font-semibold text-foreground mb-1.5">{feature.title}</h3>
              <p className="text-sm text-muted-foreground flex-grow">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default React.memo(FeaturesSection);