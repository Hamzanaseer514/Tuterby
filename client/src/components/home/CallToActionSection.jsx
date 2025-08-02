import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Zap, MessageSquare, Users, Award } from 'lucide-react';

const CallToActionSection = () => {
  const whatsAppNumber = "07466436417";
  const whatsAppURL = `https://wa.me/${whatsAppNumber.replace(/[^0-9]/g, '')}?text=Hello%20TutorNearby,%20I'd%20like%20to%20enquire%20about%20your%20services.`;

  const features = [
    {
      icon: <Zap className="h-8 w-8 text-secondary" />,
      title: "Instant Connection",
      description: "Reach out via WhatsApp for quick queries and support.",
      ariaLabel: "Learn more about instant WhatsApp connection"
    },
    {
      icon: <Users className="h-8 w-8 text-secondary" />,
      title: "Expert Tutors",
      description: "Access UK's leading educators for tailored guidance.",
      ariaLabel: "Discover our expert tutors"
    },
    {
      icon: <Award className="h-8 w-8 text-secondary" />,
      title: "Proven Results",
      description: "Achieve academic excellence with our focused approach.",
      ariaLabel: "See our proven results"
    }
  ];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
      className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-slate-800/30 dark:via-slate-900 dark:to-slate-800/40"
    >
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <MessageSquare className="h-16 w-16 text-primary mx-auto mb-6 animate-bounce" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Ready to <span className="gradient-text">Elevate Your Learning?</span>
          </h2>
          <p className="text-md sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Your ideal Tutor in UK Wide Online & In-Person Mentorship. Don't wait to unlock your potential. Connect with TutorNearby today and embark on a personalized journey to academic success. Our expert tutors are here to guide you every step of the way.
          </p>
        </motion.div>

        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-16"
        >
          <Button size="lg" asChild className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground shadow-xl hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4">
            <Link to="/contact" aria-label="Book a free consultation now">
              Book Free Consultation
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="border-primary text-primary hover:bg-primary/10 hover:text-primary shadow-lg hover:shadow-secondary/30 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4">
            <a href={whatsAppURL} target="_blank" rel="noopener noreferrer" aria-label="Chat with TutorNearby on WhatsApp for instant support">
              Chat on WhatsApp
            </a>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 bg-card/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30 border border-primary/20 dark:border-slate-700/80 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground dark:text-slate-100">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default React.memo(CallToActionSection);