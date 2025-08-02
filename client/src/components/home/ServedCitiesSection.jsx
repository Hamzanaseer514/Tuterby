import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';

const cities = [
  "London", "Manchester", "Birmingham", "Leeds", "Glasgow", 
  "Liverpool", "Bristol", "Sheffield", "Edinburgh", "Leicester",
  "Coventry", "Bradford", "Cardiff", "Nottingham", "Stoke-on-Trent",
  "Wolverhampton", "Derby", "Southampton", "Brighton", "Plymouth",
  "Hull", "Preston", "Norwich", "Cambridge", "Oxford",
  "Exeter", "York", "Bath", "Newcastle", "Reading", "Milton Keynes",
  "Aberdeen", "Portsmouth", "Swansea", "Belfast", "Dundee", "Canterbury",
  "Sunderland", "Luton", "Swindon", "Bournemouth", "Peterborough", "Ipswich",
  "Watford", "Slough", "Chelmsford"
];

const ServedCitiesSection = () => {
  return (
    <section className="py-10 md:py-12 bg-background dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 md:mb-8"
        >
          <MapPin className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-2" />
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Serving Students <span className="gradient-text">Across the UK</span>
          </h2>
          <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto">
            While we offer extensive online tutoring nationwide, find dedicated in-person support in major cities and surrounding areas.
          </p>
        </motion.div>
        <div className="flex flex-wrap justify-center items-center gap-3 mb-8">
          {cities.slice(0, 24).map((city, index) => ( 
            <motion.div
              key={city}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              viewport={{ once: true, amount: 0.1 }}
            >
              <Link to={`/blog/${city.toLowerCase().replace(/\s+/g, '-')}-tutoring`} 
                className="group flex items-center py-2 px-4 bg-muted hover:bg-primary/10 dark:bg-slate-800 dark:hover:bg-slate-700 text-muted-foreground hover:text-primary dark:text-slate-300 dark:hover:text-primary rounded-full text-xs sm:text-sm font-medium shadow-sm transition-all hover:scale-105"
                aria-label={`Find tutors in ${city} via our blog`}
              >
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-secondary group-hover:text-primary transition-colors" />
                {city}
              </Link>
            </motion.div>
          ))}
          <motion.span 
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 24 * 0.03 }}
            viewport={{ once: true, amount: 0.1 }}
            className="flex items-center py-2 px-4 rounded-full text-xs sm:text-sm font-semibold shadow-sm bg-accent text-accent-foreground dark:bg-accent/70 dark:text-accent-foreground/90"
          >
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-accent-foreground/70" />
            And many more...
          </motion.span>
        </div>
        <div className="text-center">
          <Button size="lg" asChild className="group btn-secondary-hover">
            <Link to="/blog" aria-label="Explore tutoring options in your city through our blog">
              Explore Tutoring in Your City <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default React.memo(ServedCitiesSection);