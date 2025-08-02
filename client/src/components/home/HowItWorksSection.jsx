import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, MessageCircle, CalendarCheck, Lightbulb, Award, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-primary mb-2" />,
    title: "Share Your Aspirations",
    description: "Tell us your subject, level, and learning goals. We'll begin forging your path to brilliance.",
  },
  {
    icon: <Search className="w-8 h-8 md:w-10 md:h-10 text-primary mb-2" />,
    title: "Meet Your Mentor",
    description: "Connect with your perfectly matched tutor for a free introductory chat to ensure a brilliant fit.",
  },
  {
    icon: <CalendarCheck className="w-8 h-8 md:w-10 md:h-10 text-primary mb-2" />,
    title: "Schedule & Shine",
    description: "Easily book sessions online or in-person, flexibly designed to fit your journey to success.",
  },
  {
    icon: <Award className="w-8 h-8 md:w-10 md:h-10 text-primary mb-2" />,
    title: "Achieve & Ascend",
    description: "Experience personalized learning, ignite your confidence, and watch your bright future unfold.",
  },
];

const HowItWorksSection = () => {
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="py-8 md:py-10 bg-muted dark:bg-slate-800/40 rounded-xl">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 md:mb-8"
        >
          <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-2" />
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Your Journey to Brilliance, <span className="gradient-text">Simplified</span>
          </h2>
          <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting started with TutorNearby is a seamless experience, designed to ignite your potential.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="p-5 rounded-xl shadow-lg border border-border/70 flex flex-col text-center items-center bg-card dark:bg-slate-800/70 card-hover-effect"
              variants={itemVariants}
              custom={index}
            >
              {step.icon}
              <h3 className="text-lg font-semibold text-foreground mb-1.5">{step.title}</h3>
              <p className="text-sm text-muted-foreground flex-grow">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
        <div className="text-center mt-8 md:mt-10">
          <Button size="lg" asChild className="group btn-primary-hover">
            <Link to="/contact" aria-label="Start your tutoring journey by contacting us">
              Start Forging Your Future <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default React.memo(HowItWorksSection);