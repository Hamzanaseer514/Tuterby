import React, { Suspense, lazy } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { premiumProgrammeFeatures } from '@/data/premiumServiceDetails';
import { ArrowRight, Sparkles, ExternalLink, CheckCircle, Star, Info } from 'lucide-react';
import SeoMetaTags from '@/components/SeoMetaTags';

const Accordion = lazy(() => import('@/components/ui/accordion').then(module => ({ default: module.Accordion })));
const AccordionContent = lazy(() => import('@/components/ui/accordion').then(module => ({ default: module.AccordionContent })));
const AccordionItem = lazy(() => import('@/components/ui/accordion').then(module => ({ default: module.AccordionItem })));
const AccordionTrigger = lazy(() => import('@/components/ui/accordion').then(module => ({ default: module.AccordionTrigger })));

const PageLoader = () => (
  <div className="flex justify-center items-center h-32">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const PremiumServicePage = () => {
  const location = useLocation();
  const siteUrl = "https://www.tutornearby.co.uk";

  React.useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const featureCardVariants = {
    initial: { opacity: 0, scale: 0.95, y: 15 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
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
        "name": "Premium Programme",
        "item": `${siteUrl}/premium-programme`
      }
    ]
  };

  return (
    <>
    <SeoMetaTags
      title="Premium Content on Demand & Mentorship Programme UK"
      description="Elevate your learning with TutorNearby's flagship UK programme. Get personalized content, expert mentorship, and comprehensive academic support for GCSE, A-Level, and beyond."
      keywords="premium tutoring UK, mentorship programme UK, on-demand educational content, personalized learning UK, academic coaching UK, exam success UK, UK education support"
      ogTitle="TutorNearby Premium Programme: Content on Demand & Mentorship UK"
      ogDescription="Unlock your full academic potential with our exclusive mentorship and personalized content programme, available across the UK."
      ogImage={`${siteUrl}/assets/og-images/premium-programme-og-image.png`} 
      ogUrl="/premium-programme"
      canonicalUrl="/premium-programme"
      schemaMarkup={breadcrumbSchema}
    />
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="container mx-auto px-4 py-12 md:py-20"
    >
      <header className="text-center mb-12 md:mb-16">
        <Sparkles className="w-20 h-20 text-primary mx-auto mb-6 animate-pulse" />
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6">
          <span className="gradient-text">CONTENT ON DEMAND</span> & Mentorship Programme
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Elevate your learning experience with our flagship programme, meticulously designed to provide unparalleled academic support, personalized content, and expert mentorship. This is your pathway to unlocking peak academic performance and achieving your educational aspirations.
        </p>
      </header>

      <section className="mb-12 md:mb-16 p-6 md:p-8 bg-gradient-to-br from-primary/5 via-background to-secondary/10 dark:from-primary/10 dark:via-slate-900 dark:to-secondary/15 rounded-xl shadow-xl border border-primary/20">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="flex-shrink-0">
            <Star className="w-16 h-16 md:w-24 md:h-24 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3">Why Choose This Elite Programme?</h2>
            <p className="text-muted-foreground mb-2">
              Our premium offering combines the best of personalized education with flexible, on-demand resources. It's more than just tutoring; it's a comprehensive support system.
            </p>
            <ul className="space-y-1.5 text-muted-foreground">
              <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Fully tailored content to your exact needs.</li>
              <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Direct access to expert mentors and educators.</li>
              <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Strategies to boost confidence and exam performance.</li>
              <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Rapid support for urgent learning requirements.</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
        {premiumProgrammeFeatures.map((feature, index) => {
          const IconComponent = feature.icon; 
          return (
            <motion.div
              key={feature.id}
              id={feature.id}
              variants={featureCardVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.2 }}
              className="flex flex-col bg-card dark:bg-slate-800/70 rounded-xl shadow-2xl overflow-hidden border border-border/30 hover:shadow-primary/20 transition-shadow duration-300"
            >
              {feature.image && (
                <div className="w-full h-48 overflow-hidden">
                  <img loading="lazy" src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-center mb-4">
                  {IconComponent && <IconComponent className="w-10 h-10 text-primary" />}
                </div>
                <h3 className="text-xl font-semibold text-center text-primary mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground text-center mb-4 flex-grow">{feature.shortDescription}</p>
                
                <Suspense fallback={<PageLoader />}>
                  <Accordion type="single" collapsible className="w-full mb-4">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-sm hover:no-underline justify-center">
                        <Info className="w-4 h-4 mr-2" /> More Details & Benefits
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground pt-3">
                        <p className="mb-2">{feature.detailedDescription}</p>
                        <ul className="space-y-1 list-disc list-inside pl-2">
                          {feature.benefits.map((benefit, i) => (
                            <li key={i}>{benefit}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Suspense>

                {feature.blogSlug && (
                  <Button variant="link" asChild className="text-primary hover:underline p-0 justify-center text-sm">
                    <Link to={`/blog/${feature.blogSlug}`}>
                      Learn more about {feature.title.toLowerCase()} <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <section className="mt-16 md:mt-24 text-center py-10 px-6 bg-gradient-to-r from-secondary/10 via-background to-secondary/5 dark:from-secondary/15 dark:via-slate-900 dark:to-secondary/10 rounded-xl shadow-xl border border-secondary/20">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Learning?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Invest in your future with our comprehensive Content on Demand & Mentorship Programme. Get started today and experience the TutorNearby difference.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="btn-primary-hover shadow-lg hover:shadow-primary/40">
            <Link to="/pricing#premium_services" state={{ scrollTo: 'premium_services' }}>
              View Premium Pricing <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="shadow-md hover:shadow-accent/30">
            <Link to="/contact" state={{ subjectQuery: "Enquiry for Premium Programme" }}>
              Contact Us for a Consultation <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </motion.div>
    </>
  );
};

export default PremiumServicePage;