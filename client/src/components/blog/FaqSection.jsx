import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const FaqSection = ({ title = "Frequently Asked Questions", faqs, className = "" }) => {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const midPoint = Math.ceil(faqs.length / 2);
  const leftFaqs = faqs.slice(0, midPoint);
  const rightFaqs = faqs.slice(midPoint);

  return (
    <section className={`py-10 md:py-12 ${className} bg-muted dark:bg-slate-800/40 rounded-xl`}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-10"
        >
          <HelpCircle className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-2" />
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            {title.split(' ').map((word, index, arr) => 
              index === arr.length -1 ? <span key={index} className="gradient-text">{word} </span> : `${word} `
            )}
          </h2>
          <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Answers to common questions about our tutoring services.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid md:grid-cols-2 md:gap-x-8 lg:gap-x-12 gap-y-4 max-w-full lg:max-w-6xl mx-auto"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {leftFaqs.map((faq, index) => (
                <motion.div key={`left-${index}`} variants={itemVariants}>
                  <AccordionItem value={`left-item-${index}`} className="group bg-card dark:bg-slate-800/70 rounded-lg shadow-lg hover:shadow-primary/20 transition-all duration-300 border-l-4 border-transparent data-[state=open]:border-primary data-[state=open]:bg-primary/5 data-[state=open]:dark:bg-primary/10">
                    <AccordionTrigger className="p-5 text-left font-semibold text-sm sm:text-base hover:no-underline text-foreground data-[state=open]:text-primary data-[state=open]:font-bold flex justify-between items-center">
                      <span>{faq.question}</span>
                      <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary" />
                    </AccordionTrigger>
                    <AccordionContent className="p-5 pt-0 text-muted-foreground text-sm data-[state=open]:text-foreground/90 dark:data-[state=open]:text-slate-300">
                      <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>

          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {rightFaqs.map((faq, index) => (
                <motion.div key={`right-${index}`} variants={itemVariants}>
                   <AccordionItem value={`right-item-${index}`} className="group bg-card dark:bg-slate-800/70 rounded-lg shadow-lg hover:shadow-secondary/20 transition-all duration-300 border-l-4 border-transparent data-[state=open]:border-secondary data-[state=open]:bg-secondary/5 data-[state=open]:dark:bg-secondary/10">
                    <AccordionTrigger className="p-5 text-left font-semibold text-sm sm:text-base hover:no-underline text-foreground data-[state=open]:text-secondary data-[state=open]:font-bold flex justify-between items-center">
                      <span>{faq.question}</span>
                       <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 group-data-[state=open]:text-secondary" />
                    </AccordionTrigger>
                    <AccordionContent className="p-5 pt-0 text-muted-foreground text-sm data-[state=open]:text-foreground/90 dark:data-[state=open]:text-slate-300">
                      <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FaqSection;