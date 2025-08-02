import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import PricingCard from '@/components/pricing/PricingCard';
import RoyaltyCard from '@/components/pricing/RoyaltyCard';
import PremiumServiceCard from '@/components/pricing/PremiumServiceCard';
import CustomPackageCalculator from '@/components/pricing/CustomPackageCalculator';
import { 
  hourlyPricingTiersData, 
  familyRoyaltyPlansData, 
  undergraduateRoyaltyPlansData,
  premiumServicesData,
  generalBenefitsData,
  filterButtonsData as importedFilterButtonsData
} from '@/data/pricingData';
import { motion } from 'framer-motion';
import { Users, Brain, Zap, Star, Sparkles, Layers, GraduationCap, BookOpen, Crown, Tag } from 'lucide-react';
import SeoMetaTags from '@/components/SeoMetaTags';

const PricingPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const filterButtons = importedFilterButtonsData;
  const siteUrl = "https://www.tutornearby.co.uk";
  
  const higherEdIBPlanIdentifier = 'hourly_higher_ib';
  const mentorshipProgramIdentifier = 'mentorship_program';

  const regularHourlyPlans = useMemo(() => hourlyPricingTiersData.filter(plan => plan.type !== higherEdIBPlanIdentifier), []);
  const higherEdIBPlan = useMemo(() => hourlyPricingTiersData.find(plan => plan.type === higherEdIBPlanIdentifier), []);
  const mentorshipProgram = useMemo(() => premiumServicesData[0], []);

  const isPlanVisible = (planCategory) => {
    return activeFilter === 'all' || activeFilter === planCategory;
  };
  
  const showRegularHourly = isPlanVisible('hourly') && regularHourlyPlans.length > 0;
  const showHigherEdIB = isPlanVisible('hourly') && higherEdIBPlan;
  const showMentorshipProgram = isPlanVisible('premium_services') || activeFilter === 'all';
  
  const showFamilyRoyalty = isPlanVisible('family_royalty') && familyRoyaltyPlansData.length > 0;
  const showUndergradRoyalty = isPlanVisible('undergrad_royalty') && undergraduateRoyaltyPlansData.length > 0;

  const displayMentorshipNextToIB = showHigherEdIB && showMentorshipProgram;

  const sectionAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const cardAnimation = (index) => ({
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, delay: index * 0.1 }
  });

  const renderGrid = (items, CardComponent, popularPropName = 'popular') => {
    const gridClasses = `grid grid-cols-1 md:grid-cols-2 ${items.length === 1 ? 'lg:grid-cols-1' : items.length === 2 ? 'lg:grid-cols-2 justify-items-center' : 'lg:grid-cols-3'} gap-6 md:gap-8 items-stretch`;
    
    return (
      <div className={`${gridClasses}`}>
        {items.map((item, index) => (
          <motion.div
            key={item.name}
            {...cardAnimation(index)}
            className={`h-full w-full flex ${items.length === 1 ? 'lg:max-w-xl md:max-w-lg mx-auto' : ''} ${items.length === 2 && 'lg:grid-cols-2' ? 'max-w-full' : ''}`}
          >
            {CardComponent === RoyaltyCard ? (
              <RoyaltyCard plan={item} />
            ) : (
              <PricingCard tier={item} popular={item[popularPropName]} />
            )}
          </motion.div>
        ))}
      </div>
    );
  };
  
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${siteUrl}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Pricing",
        "item": `${siteUrl}/pricing`
      }
    ]
  };

  return (
    <>
    <SeoMetaTags
      title="Tutoring Prices & Packages - Affordable UK Tutoring"
      description="Explore TutorNearby's transparent pricing for GCSE, A-Level, and Undergraduate tutoring. Find affordable hourly rates, family royalty cards, and premium mentorship programmes in the UK."
      keywords="tutoring prices UK, tutoring packages UK, affordable tutoring UK, GCSE tutor cost, A-Level tutor rates, university tutoring fees, TutorNearby pricing, find a tutor price"
      ogTitle="Affordable Tutoring Prices & Packages | TutorNearby UK"
      ogDescription="Discover flexible and transparent pricing plans for expert tutoring services across the UK. Invest in academic success with TutorNearby."
      ogImage={`${siteUrl}/assets/og-images/pricing-og-image.png`} 
      ogUrl="/pricing"
      canonicalUrl="/pricing"
      schemaMarkup={breadcrumbSchema}
    />
    <div className="container mx-auto py-12 md:py-16 px-2 sm:px-4 md:px-6">
      <motion.div
        {...sectionAnimation}
        className="text-center mb-10 md:mb-12"
      >
        <Tag className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4 pb-1">Pricing That Powers Potential</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Flexible, transparent plans designed to unlock academic excellence. Expert tutors and personalized support included.
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-2 mb-10 md:mb-12">
        {filterButtons.map(btn => (
          <Button
            key={btn.filter}
            variant={activeFilter === btn.filter ? 'default' : 'outline'}
            onClick={() => setActiveFilter(btn.filter)}
            className="group"
            aria-label={`Filter pricing plans to show ${btn.label} options`}
          >
            {React.cloneElement(btn.icon, { className: `mr-2 h-4 w-4 ${activeFilter === btn.filter ? 'text-primary-foreground' : 'text-primary group-hover:text-accent-foreground'}` })}
            {btn.label}
          </Button>
        ))}
      </div>

      {(showRegularHourly || showHigherEdIB) && (
        <motion.section
          {...sectionAnimation}
          transition={{ ...sectionAnimation.transition, delay: 0.1 }}
          className="mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-10 gradient-text">Hourly Tutoring Plans</h2>
          
          {showRegularHourly && renderGrid(regularHourlyPlans, PricingCard, 'popular')}

          {showHigherEdIB && (
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-stretch ${showRegularHourly ? 'mt-8' : ''}`}>
              <motion.div
                key={higherEdIBPlan.name}
                {...cardAnimation(0)}
                className="h-full w-full flex lg:col-span-1"
              >
                <PricingCard tier={higherEdIBPlan} popular={higherEdIBPlan.popular} />
              </motion.div>

              {displayMentorshipNextToIB && (
                <motion.div
                  key={mentorshipProgram.name}
                  {...cardAnimation(1)}
                  className="h-full w-full flex lg:col-span-2"
                >
                  <PremiumServiceCard service={mentorshipProgram} />
                </motion.div>
              )}
            </div>
          )}
        </motion.section>
      )}

      {showFamilyRoyalty && (
        <motion.section 
          {...sectionAnimation}
          transition={{ ...sectionAnimation.transition, delay: 0.2 }}
          className="py-12 md:py-16 bg-gradient-to-b from-muted/30 via-background to-muted/30 dark:from-slate-800/30 dark:via-slate-900 dark:to-slate-800/30 mb-12 md:mb-16 rounded-xl"
        >
          <div className="w-full">
            <div className="text-center mb-10 md:mb-12 px-2 sm:px-4 md:px-0">
              <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Family Royalty <span className="gradient-text">Value Cards</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Invest in your family's collective success with our exclusive Royalty Cards, offering significant savings and premium benefits.
              </p>
            </div>
            {renderGrid(familyRoyaltyPlansData, RoyaltyCard)}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center mt-10 text-sm text-muted-foreground px-2 sm:px-4 md:px-0"
            >
              * Family Royalty Cards cover all academic levels. Hours are pooled and flexibly distributed. Terms apply.
            </motion.p>
          </div>
        </motion.section>
      )}
      
      {showUndergradRoyalty && (
         <motion.section 
          {...sectionAnimation}
          transition={{ ...sectionAnimation.transition, delay: 0.3 }}
          className="py-12 md:py-16 bg-gradient-to-b from-primary/5 via-background to-secondary/5 dark:from-slate-800/20 dark:via-slate-900/80 dark:to-slate-800/20 mb-12 md:mb-16 rounded-xl"
        >
          <div className="w-full">
            <div className="text-center mb-10 md:mb-12 px-2 sm:px-4 md:px-0">
              <GraduationCap className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Undergraduate Royalty <span className="gradient-text">Specialist Cards</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Dedicated monthly packages for undergraduate students seeking comprehensive support for their degree.
              </p>
            </div>
            {renderGrid(undergraduateRoyaltyPlansData, RoyaltyCard)}
             <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center mt-10 text-sm text-muted-foreground px-2 sm:px-4 md:px-0"
            >
              * Undergraduate Royalty Cards are per student. Terms and conditions apply.
            </motion.p>
          </div>
        </motion.section>
      )}

      {showMentorshipProgram && !displayMentorshipNextToIB && (
        <motion.section
          {...sectionAnimation}
          transition={{ ...sectionAnimation.transition, delay: 0.4 }}
          className="mb-12 md:mb-16"
        >
          <div className="text-center mb-10 md:mb-12">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="gradient-text">Flagship Mentorship Programme</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mt-2">
              Our most comprehensive offering for transformative academic results.
            </p>
          </div>
          <motion.div
            key={mentorshipProgram.name}
            {...cardAnimation(0)}
            className="w-full"
          >
            <PremiumServiceCard service={mentorshipProgram} />
          </motion.div>
        </motion.section>
      )}

      <motion.div
        {...sectionAnimation}
        transition={{ ...sectionAnimation.transition, delay: 0.5 }}
        className="mb-12 md:mb-16"
      >
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-3">The TutorNearby Difference</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            More than tutors, we are dedicated partners in your academic journey.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-stretch">
          {generalBenefitsData.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              {...cardAnimation(index)}
              className="bg-card dark:bg-slate-800/50 p-6 rounded-xl shadow-lg border border-border/60 text-left flex flex-col transition-all duration-300 hover:shadow-primary/20 hover:border-primary/50 items-stretch"
            >
              <div className="mb-4 flex justify-start">
                {React.cloneElement(benefit.icon, { className: "w-10 h-10 text-primary opacity-70" })}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground flex-grow">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        {...sectionAnimation}
        transition={{ ...sectionAnimation.transition, delay: 0.6 }}
        className="mt-16" 
      >
        <CustomPackageCalculator />
      </motion.div>

    </div>
    </>
  );
};

export default PricingPage;