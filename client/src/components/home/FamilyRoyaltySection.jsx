import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Users, Zap, Percent, ArrowRight, Sparkles, BookCheck, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const royaltyPlansData = [
  {
    name: "Silver Family Royalty",
    level: "All Levels (GCSE, A-Level, IB, BTEC, UG)",
    kids: "Up to 2 Kids",
    price: 1700,
    hoursPerStudent: 40,
    subjectsPerStudent: 6,
    savings: "Up to 33%",
    icon: <Crown className="w-10 h-10 text-slate-400" />,
    borderColor: "border-slate-400",
    gradientFrom: "from-slate-500",
    gradientTo: "to-slate-700",
    features: [
      "Dedicated academic advisor",
      "Priority tutor matching",
      "Flexible hour distribution",
      "Coverage of up to 6 subjects/modules per student",
      "Monthly progress reports & strategy calls",
      "Access to exclusive workshops (2 per year)",
      "Personalized Roadmap & Goal Setting Sessions",
    ],
    description: "Ideal for smaller families seeking comprehensive, consistent, high-quality tutoring across various levels with significant savings."
  },
  {
    name: "Gold Family Royalty",
    level: "All Levels (GCSE, A-Level, IB, BTEC, UG)",
    kids: "Up to 3 Kids",
    price: 2500,
    hoursPerStudent: 40,
    subjectsPerStudent: 6,
    savings: "Up to 33%+", 
    icon: <Crown className="w-10 h-10 text-amber-400" />,
    borderColor: "border-amber-400",
    gradientFrom: "from-amber-400",
    gradientTo: "to-amber-600",
    features: [
      "All Silver benefits, plus:",
      "Enhanced priority support & dedicated success manager",
      "Sibling collaboration & study group facilitation",
      "Complimentary diagnostic assessments for each child",
      "Access to exclusive workshops (4 per year)",
      "Bi-annual comprehensive academic strategy review",
      "University application or career guidance add-on",
    ],
    description: "The ultimate package for families committed to across-the-board academic excellence, offering maximum value, flexibility, and support for all children's needs."
  }
];

const FamilyRoyaltySection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-muted/30 via-background to-muted/30 dark:from-slate-800/30 dark:via-slate-900 dark:to-slate-800/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Family <span className="gradient-text">Royalty Cards</span>: Shared Success
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Empower your entire family's academic journey with our premium Royalty Cards. Unlock exceptional value, dedicated support, and significant savings across all educational levels.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {royaltyPlansData.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="h-full"
            >
              <Card className={`flex flex-col h-full shadow-2xl hover:shadow-primary/40 dark:hover:shadow-primary/50 transition-all duration-300 ease-in-out transform hover:-translate-y-2 overflow-hidden border-2 ${plan.borderColor} bg-card`}>
                <CardHeader className={`p-6 text-white ${plan.gradientFrom} ${plan.gradientTo} bg-gradient-to-br`}>
                  <div className="flex items-center justify-between mb-3">
                    {React.cloneElement(plan.icon, { className: "w-12 h-12" })}
                    <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">{plan.kids}</span>
                  </div>
                  <CardTitle className="text-3xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-white/90 text-sm">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow p-6 space-y-6">
                  <div className="text-center mb-6">
                    <p className="text-5xl font-bold text-foreground">£{plan.price}</p>
                    <p className="text-muted-foreground text-sm">per month</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-foreground">
                      <Users className="w-5 h-5 text-primary mr-3 shrink-0" />
                      <span>{plan.kids} - {plan.level}</span>
                    </div>
                    <div className="flex items-center text-foreground">
                      <Zap className="w-5 h-5 text-primary mr-3 shrink-0" />
                      <span>Up to {plan.hoursPerStudent} hours per student/month</span>
                    </div>
                     <div className="flex items-center text-foreground">
                      <BookCheck className="w-5 h-5 text-primary mr-3 shrink-0" />
                      <span>Covers up to {plan.subjectsPerStudent} subjects/modules per student</span>
                    </div>
                    <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                      <Percent className="w-5 h-5 mr-3 shrink-0" />
                      <span>Save {plan.savings} vs. standard rates!</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2 mt-4">Key Benefits:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start text-sm text-muted-foreground">
                          <Brain className="w-4 h-4 text-secondary mr-2 shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="p-6 bg-muted/30 dark:bg-slate-800/20 mt-auto">
                  <Button size="lg" className="w-full group btn-primary-hover text-base py-6" asChild>
                    <Link to="/contact" state={{ selectedPackage: plan.name, price: plan.price, type: 'family_royalty' }} aria-label={`Enquire about the ${plan.name} family royalty plan`}>
                      Enquire for {plan.name} <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center mt-12 text-sm text-muted-foreground"
        >
            * Family Royalty Cards are designed for ultimate flexibility across all our offered academic levels. Hours are pooled and can be distributed among eligible children. Terms and conditions apply.
        </motion.p>
      </div>
    </section>
  );
};

export default FamilyRoyaltySection;