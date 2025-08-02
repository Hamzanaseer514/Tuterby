import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Tag, Layers, BookOpen as BookOpenIcon, Crown, Baby as Child, Target, Award, GraduationCap, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

const allPlansData = {
  hourly_primary_secondary: {
    name: "Primary & Secondary",
    price: "£22/hour",
    details: ["KS1, KS2 & KS3 Focus", "Engaging & Fun Learning", "Core Literacy & Numeracy"],
    icon: <Child className="w-7 h-7 text-teal-500" />,
    type: "hourly_primary_secondary",
    category: "hourly",
    order: 0,
  },
  hourly_foundational: {
    name: "Foundational Hourly",
    price: "£25/hour",
    details: ["GCSE Focus", "Core Subject Tutors", "Building Strong Basics"],
    icon: <BookOpenIcon className="w-7 h-7 text-green-500" />,
    type: "hourly_foundational",
    category: "hourly",
    order: 1,
  },
  hourly_advanced: {
    name: "Advanced Levels Hourly",
    price: "£30/hour",
    details: ["A-Level & BTEC Focus", "Specialist Tutors", "Exam Techniques"],
    icon: <Target className="w-7 h-7 text-blue-500" />,
    type: "hourly_advanced",
    category: "hourly",
    order: 2,
  },
  hourly_higher_ib: {
    name: "Higher Ed & IB Hourly",
    price: "£45/hour",
    details: ["Undergrad & IB Support", "Expert Subject Mentors", "Essay & Exam Skills"],
    icon: <Award className="w-7 h-7 text-purple-500" />,
    type: "hourly_higher_ib",
    category: "hourly",
    order: 3,
  },
  family_silver: {
    name: "Silver Family Royalty",
    price: "£1700/month",
    details: ["Up to 2 Kids", "40hrs/student", "All Levels Coverage"],
    icon: <Crown className="w-7 h-7 text-slate-400" />,
    type: "family_royalty_silver",
    category: "royalty",
    order: 4,
  },
  family_gold: {
    name: "Gold Family Royalty",
    price: "£2500/month",
    details: ["Up to 3 Kids", "40hrs/student", "Enhanced Support"],
    icon: <Crown className="w-7 h-7 text-amber-400" />,
    type: "family_royalty_gold",
    category: "royalty",
    order: 5,
  },
  undergrad_silver: {
    name: "UG Silver Royalty",
    price: "£1000/month",
    details: ["Per Student", "40hrs/month", "Up to 4 Modules"],
    icon: <GraduationCap className="w-7 h-7 text-sky-500" />,
    type: "undergrad_royalty_silver",
    category: "royalty",
    order: 6,
  },
  undergrad_gold: {
    name: "UG Gold Royalty",
    price: "£1250/month",
    details: ["Per Student", "40hrs/month", "All Core Modules"],
    icon: <ShieldCheck className="w-7 h-7 text-yellow-500" />,
    type: "undergrad_royalty_gold",
    category: "royalty",
    order: 7,
  },
  mentorship_program: {
    name: "CONTENT ON DEMAND & Mentorship",
    price: "From £35/hour",
    details: ["Personalised Content", "Expert Mentorship", "Exam Technique Modules"],
    icon: <Sparkles className="w-7 h-7 text-pink-500" />,
    type: "mentorship_program",
    category: "premium_services",
    order: 8, 
  }
};

const PlanItem = React.memo(({ plan, categoryKey }) => {
  const isPremiumProgramme = plan.type === 'mentorship_program';
  const learnMoreAriaLabel = `Learn more about the ${plan.name} pricing plan`;
  const exploreProgrammeAriaLabel = `Explore the full ${plan.name} programme details`;
  const viewOnPricingPageAriaLabel = `View ${plan.name} on the main pricing page`;


  return (
    <div className="flex flex-col h-full p-5 rounded-xl shadow-xl border border-border/70 bg-gradient-to-br from-card via-muted/10 to-card dark:from-slate-800 dark:via-slate-700/40 dark:to-slate-800 card-hover-effect">
      <div className="items-center text-center mb-3">
        <div className="p-2.5 bg-primary/10 rounded-full mb-2 inline-block">
          {plan.icon}
        </div>
        <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
        <p className="text-2xl font-bold text-primary mt-1">{plan.price}</p>
      </div>
      <div className="flex-grow min-h-[60px] md:min-h-[80px]"> 
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {plan.details.map((detail, i) => (
            <li key={i} className="flex items-start">
              <Sparkles className="w-3.5 h-3.5 mr-2 mt-0.5 text-yellow-500 shrink-0" />
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 space-y-2">
        {isPremiumProgramme ? (
          <>
            <Button variant="default" className="w-full group btn-primary-hover" asChild>
              <Link to="/premium-programme" aria-label={exploreProgrammeAriaLabel}>
                Explore Full Programme <ExternalLink className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full group" asChild>
              <Link to="/pricing" state={{ scrollTo: 'premium_services', selectedPackage: plan.name, type: plan.type }} aria-label={viewOnPricingPageAriaLabel}>
                View on Pricing Page <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </>
        ) : (
          <Button variant="outline" className="w-full group" asChild>
            <Link to="/pricing" state={{ scrollTo: categoryKey, selectedPackage: plan.name, type: plan.type }} aria-label={learnMoreAriaLabel}>
              Learn More <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
});


const HomePricingHighlight = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filterButtonsDesktop = useMemo(() => [
    { label: 'Show All', filter: 'all', icon: <Layers className="mr-2 h-4 w-4" /> },
    { label: 'Hourly Plans', filter: 'hourly', icon: <BookOpenIcon className="mr-2 h-4 w-4" /> },
    { label: 'Royalty Cards', filter: 'royalty', icon: <Crown className="mr-2 h-4 w-4" /> },
    { label: 'Premium Services', filter: 'premium_services', icon: <Sparkles className="mr-2 h-4 w-4" /> },
  ], []);
  
  const visiblePlans = useMemo(() => {
    let plansArray = Object.values(allPlansData).map((plan, index) => ({ ...plan, key: Object.keys(allPlansData)[index]}));
    plansArray.sort((a, b) => a.order - b.order);

    if (isMobile) {
      if (activeFilter === 'premium_services') {
        return plansArray.filter(plan => plan.category === 'premium_services');
      }
      if (activeFilter === 'hourly') {
         return plansArray.filter(plan => plan.category === 'hourly').slice(0,3);
      }
      if (activeFilter === 'royalty') {
         return plansArray.filter(plan => plan.category === 'royalty').slice(0,2);
      }
      return plansArray.filter(plan => plan.category === 'hourly').slice(0, 3);
    }

    if (activeFilter === 'all') {
      return plansArray.slice(0, 9); 
    }
    return plansArray.filter(plan => plan.category === activeFilter);
  }, [activeFilter, isMobile]);
  

  return (
    <section className="py-8 md:py-10 bg-gradient-to-b from-background via-muted/20 to-background dark:from-slate-900 dark:via-slate-800/20 dark:to-slate-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 md:mb-8"
        >
          <Tag className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-2" />
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Invest in Your <span className="gradient-text">Brilliant Future</span>
          </h2>
          <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Transparent, value-driven options to fuel your academic journey. Explore hourly rates, premium royalty cards, and our exclusive mentorship programme designed to ignite your potential.
          </p>
        </motion.div>

        {!isMobile && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {filterButtonsDesktop.map(btn => (
              <Button
                key={btn.filter}
                variant={activeFilter === btn.filter ? 'default' : 'outline'}
                onClick={() => setActiveFilter(btn.filter)}
                className="group"
                aria-label={`Filter pricing plans by ${btn.label}`}
              >
                {React.cloneElement(btn.icon, { className: `mr-2 h-4 w-4 ${activeFilter === btn.filter ? 'text-primary-foreground' : 'text-primary group-hover:text-accent-foreground'}` })}
                {btn.label}
              </Button>
            ))}
          </div>
        )}
        
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-5`}>
          {visiblePlans.map((planData, index) => (
            <motion.div
              key={planData.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              layout
            >
              <PlanItem plan={planData} categoryKey={planData.category} />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8 md:mt-10">
          <Button size="lg" asChild className="group btn-secondary-hover">
            <Link to="/pricing" aria-label="View all pricing details and plans">
              {isMobile ? 'Discover All Plans' : 'View All Pricing Details'}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
          {isMobile && (
            <p className="text-sm text-muted-foreground mt-2">
              Explore all our plans, including Royalty Cards and Premium Services, on our main pricing page.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default React.memo(HomePricingHighlight);