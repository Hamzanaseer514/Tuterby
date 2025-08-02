import React from 'react';
import { motion } from 'framer-motion';
import { Star, UserCircle, MessageSquare as MessageSquareQuote, Sparkles } from 'lucide-react';

const testimonialsData = [
  {
    name: "Sarah L. - Parent",
    level: "GCSE Maths & Science",
    quote: "TutorNearby ignited my son's confidence and his grades soared! The personalized approach truly forged a path to success. Highly recommend!",
    rating: 5,
  },
  {
    name: "James B. - A-Level Student",
    level: "A-Level Physics",
    quote: "My tutor was incredibly knowledgeable, making complex topics click. Their guidance helped me secure my university offer and forge a brighter future!",
    rating: 5,
  },
  {
    name: "Aisha K. - Undergraduate",
    level: "University Economics",
    quote: "The support for my dissertation and exam prep was invaluable. My tutor was a true expert and mentor, helping me ignite my academic potential.",
    rating: 5,
  },
  {
    name: "David P. - Parent",
    level: "Primary English & Maths",
    quote: "The tutor made learning fun and engaging for my daughter. Her reading and maths skills have improved significantly. Thank you for igniting her love for learning!",
    rating: 5,
  },
  {
    name: "Chloe M. - IB Student",
    level: "IB Higher Level Chemistry",
    quote: "Fantastic support for my IB Chemistry. My tutor helped me grasp difficult concepts and improve my exam technique. So grateful for this brilliant guidance!",
    rating: 5,
  },
  {
    name: "Ben R. - BTEC Student",
    level: "BTEC Level 3 Business",
    quote: "My tutor provided excellent guidance for my BTEC assignments and helped me structure my work effectively. Achieved a Distinction, forging a great start to my career!",
    rating: 5,
  }
];

const TestimonialsSection = () => {
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15, duration: 0.5 } },
  };

  return (
    <section className="py-10 md:py-12 bg-background dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-10"
        >
          <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-2" />
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Real Stories of <span className="gradient-text">Brilliance Ignited</span>
          </h2>
          <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover how TutorNearby has helped students and parents forge brighter academic futures.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {testimonialsData.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="h-full"
            >
              <div className="relative h-full flex flex-col p-6 rounded-xl shadow-xl border border-border/70 bg-gradient-to-br from-card via-muted/5 to-card dark:from-slate-800 dark:via-slate-700/30 dark:to-slate-800 transition-all duration-300 ease-in-out hover:shadow-primary/20 hover:border-primary/30 hover:-translate-y-1 group">
                <MessageSquareQuote className="absolute top-4 right-4 w-12 h-12 text-primary/10 dark:text-primary/20 transition-transform duration-300 group-hover:scale-110" />
                <div className="mb-4 z-10">
                  <p className="font-semibold text-foreground text-md">{testimonial.name}</p>
                  <p className="text-xs text-primary font-medium">{testimonial.level}</p>
                </div>
                <div className="flex mb-3 z-10">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                  {[...Array(5 - testimonial.rating)].map((_, i) => (
                    <Star key={i + testimonial.rating} className="w-5 h-5 text-yellow-400/50" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic mb-4 flex-grow leading-relaxed z-10">"{testimonial.quote}"</p>
                <div className="mt-auto text-right z-10">
                  <span className="text-xs text-muted-foreground/70 group-hover:text-primary/80 transition-colors">Verified Review</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default React.memo(TestimonialsSection);