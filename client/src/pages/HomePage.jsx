import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '@/components/home/HeroSection';
import SeoMetaTags from '@/components/SeoMetaTags';
import { homePageFaqs } from '@/data/homePageFaqs';

const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const LazyFeaturesSection = lazy(() => import('@/components/home/FeaturesSection'));
const LazyHowItWorksSection = lazy(() => import('@/components/home/HowItWorksSection'));
const LazyHomePricingHighlight = lazy(() => import('@/components/home/HomePricingHighlight'));
const LazySubjectsOverviewSection = lazy(() => import('@/components/home/SubjectsOverviewSection'));
const LazyTestimonialsSection = lazy(() => import('@/components/home/TestimonialsSection'));
const LazyHomeBlogPreview = lazy(() => import('@/components/home/HomeBlogPreview'));
const LazyFaqSection = lazy(() => import('@/components/blog/FaqSection'));
const LazyServedCitiesSection = lazy(() => import('@/components/home/ServedCitiesSection'));
const LazyCallToActionSection = lazy(() => import('@/components/home/CallToActionSection'));


const HomePage = () => {
  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4,
  };

  const siteUrl = "https://www.tutornearby.co.uk";
  const homePageFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": homePageFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer.replace(/<[^>]*>?/gm, '') 
      }
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": `${siteUrl}/`
    }]
  };
  
  const schemaMarkup = [homePageFaqSchema, breadcrumbSchema];

  return (
    <>
    <SeoMetaTags
      title="Expert GCSE, A-Level & Undergraduate Tutoring UK"
      description="TutorNearby offers personalised online and in-person tutoring for GCSE, A-Level, and Undergraduate students. Achieve academic excellence with our expert tutors and tailored learning plans across the UK."
      keywords="GCSE tutors, A-Level tutors, Undergraduate tutors, online tutoring UK, in-person tutoring, UK tutoring services, exam preparation, maths tutor, science tutor, english tutor, find a tutor, local tutors"
      ogUrl="/"
      canonicalUrl="/"
      ogImage={`${siteUrl}/assets/TutorNearbySocialShare-BEc2r8ps.png`}
      schemaMarkup={schemaMarkup}
    />
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="space-y-12 md:space-y-16 lg:space-y-20 xl:space-y-24"
    >
      <HeroSection />
      <Suspense fallback={<PageLoader />}>
        <LazyFeaturesSection />
        <LazyHowItWorksSection />
        <LazyHomePricingHighlight />
        <LazySubjectsOverviewSection />
        <LazyTestimonialsSection />
        <LazyHomeBlogPreview />
        <LazyFaqSection title="Common Queries about TutorNearby" faqs={homePageFaqs} />
        <LazyServedCitiesSection />
        <LazyCallToActionSection />
      </Suspense>
    </motion.div>
    </>
  );
};

export default HomePage;