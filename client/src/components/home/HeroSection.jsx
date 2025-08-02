import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Award, Brain, Sparkles, BarChart3, Zap, Star, CheckCircle, ExternalLink } from 'lucide-react';

const HeroSection = () => {
  const whatsAppNumber = "07466436417";
  const whatsAppURL = `https://wa.me/${whatsAppNumber.replace(/[^0-9]/g, '')}?text=Hello%20TutorNearby,%20I'd%20like%20to%20enquire%20about%20your%20services.`;

  const integratedBenefits = [
    { icon: <Award className="w-6 h-6 text-primary mr-3 shrink-0" />, text: "Elite Tutors: Igniting Potential" },
    { icon: <BarChart3 className="w-6 h-6 text-primary mr-3 shrink-0" />, text: "Proven Results: Forging Success" },
    { icon: <Zap className="w-6 h-6 text-primary mr-3 shrink-0" />, text: "Flexible Learning: Online & In-Person" },
    { icon: <Brain className="w-6 h-6 text-primary mr-3 shrink-0" />, text: "Personalized Journeys: Tailored for You" },
  ];

  const heroSectionVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2,
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.section 
      variants={heroSectionVariants}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background dark:from-slate-900 dark:via-slate-800/30 dark:to-slate-900 pt-8 md:pt-12 pb-10 md:pb-16"
    >
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="heroPattern" patternUnits="userSpaceOnUse" width="80" height="80" patternTransform="scale(1) rotate(0)"><rect x="0" y="0" width="100%" height="100%" fill="hsla(0,0%,100%,1)"/><path d="M80 40c0-22.091-17.909-40-40-40S0 17.909 0 40s17.909 40 40 40 40-17.909 40-40zm0 0L0 0M0 40l80 40M40 0l-40 80M80 0L0 80" strokeWidth="0.7" stroke="hsla(var(--primary), 0.1)" fill="none"/></pattern></defs><rect width="800%" height="800%" transform="translate(0,0)" fill="url(#heroPattern)"/></svg>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
            variants={itemVariants}
            className="flex items-center justify-center md:justify-start mb-3"
        >
            <Star className="w-6 h-6 mr-2 text-yellow-400 animate-pulse" />
            <span className="hidden md:inline text-sm font-medium tracking-wider uppercase text-muted-foreground">
              <span className="gradient-text font-semibold">TutorNearby</span> — Your Catalyst for Academic Excellence
            </span>
        </motion.div>
        <div className="grid md:grid-cols-5 gap-8 items-center">
          <motion.div
            variants={itemVariants}
            className="text-center md:text-left md:col-span-3"
          >
            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-[3.5rem] lg:text-6xl font-bold mb-4 leading-tight md:leading-snug">
              <span className="gradient-text">Igniting Brilliance,</span> <span className="text-foreground dark:text-slate-100 block sm:inline">Forging Bright Futures.</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground mb-5">
              Unlock your true potential with TutorNearby. We provide premier online and in-person tutoring for GCSE, A-Levels, BTECs, IB, and Undergraduate success, meticulously tailored by the UK's leading educators to illuminate your path to achievement.
            </motion.p>

            <motion.div variants={itemVariants} className="my-6">
              <h3 className="text-md font-semibold text-primary mb-3 text-center md:text-left">
                <span className="gradient-text py-1">The TutorNearby Advantage:</span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {integratedBenefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    variants={itemVariants}
                    className="flex items-center text-sm text-foreground dark:text-slate-200 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-primary/20 dark:border-slate-700 p-3 sm:p-4 rounded-lg shadow-lg hover:scale-[1.03] hover:shadow-primary/20 dark:hover:shadow-primary/30 transition-all duration-300"
                  >
                    {benefit.icon}
                    <span className="font-medium">{benefit.text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center md:justify-start mt-8">
              <Button size="lg" asChild className="shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105">
                <Link to="/contact" aria-label="Book a free consultation to start your journey">
                  Ignite Your Journey <Sparkles className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="shadow-md hover:shadow-secondary/40 transition-all duration-300 transform hover:scale-105 border-primary/50 hover:border-primary text-primary hover:bg-primary/5 dark:border-slate-600 dark:hover:border-primary dark:text-slate-100 dark:hover:bg-primary/10">
                <Link to="/subjects" aria-label="Explore our tutoring subjects">
                  Explore Our Subjects <BookOpen className="ml-2 h-5 w-5" />
                </Link>
              </Button>
               <Button variant="secondary" size="lg" asChild className="shadow-md hover:shadow-accent/40 transition-all duration-300 transform hover:scale-105 border-accent/50 hover:border-accent text-accent-foreground hover:bg-accent/80 dark:border-slate-600 dark:hover:border-accent dark:text-slate-100 dark:hover:bg-accent/80">
                <Link to="/premium-programme" aria-label="Learn about our Premium Programme">
                  Our Premium Programme <ExternalLink className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
            <motion.div variants={itemVariants} className="mt-6 text-center md:text-left">
              <p className="text-xs text-muted-foreground mb-1.5">Or connect with us instantly:</p>
              <Button variant="success" size="default" asChild className="bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105">
                 <a href={whatsAppURL} target="_blank" rel="noopener noreferrer" aria-label="Chat with TutorNearby on WhatsApp">
                    Chat on WhatsApp
                 </a>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="hidden md:block md:col-span-2 self-center md:h-[500px] lg:h-[580px] xl:h-[620px]"
          >
            <img  
              loading="lazy"
              className="rounded-xl shadow-2xl object-cover w-full h-full" 
              alt="Dynamic learning session with TutorNearby expert and engaged students collaborating." 
              src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            />
            <p className="text-xs text-center mt-3 text-muted-foreground italic">
              "TutorNearby didn't just teach; they inspired. A true game-changer!" – Grateful Student
            </p>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default React.memo(HeroSection);