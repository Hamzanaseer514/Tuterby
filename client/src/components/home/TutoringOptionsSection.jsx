import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Home, Globe } from 'lucide-react';

const TutoringOptionsSection = () => {
  return (
    <section className="container mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        Flexible Tutoring, <span className="gradient-text">Your Way</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <Card className="h-full hover:shadow-xl transition-shadow duration-300 glassmorphism">
            <CardHeader className="items-center text-center">
              <Globe className="w-12 h-12 text-primary mb-3" />
              <CardTitle className="text-2xl">Online Tutoring</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">Access expert tutors from anywhere in the UK. Interactive online sessions with cutting-edge tools for an engaging learning experience.</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Card className="h-full hover:shadow-xl transition-shadow duration-300 glassmorphism">
            <CardHeader className="items-center text-center">
              <Home className="w-12 h-12 text-secondary mb-3" />
              <CardTitle className="text-2xl">In-Person Tutoring</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">Prefer face-to-face learning? We offer in-person tutoring in Manchester, Liverpool, London, and other major UK cities. <Link to="/contact" className="text-primary hover:underline">Enquire for availability</Link>.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default TutoringOptionsSection;