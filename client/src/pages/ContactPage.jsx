import React from 'react';
    import { motion } from 'framer-motion';
    import ContactForm from '@/components/contact/ContactForm';
    import ContactInfo from '@/components/contact/ContactInfo';
    import ComplaintsInfo from '@/components/contact/ComplaintsInfo';
    import SeoMetaTags from '@/components/SeoMetaTags';
    import { Mail } from 'lucide-react';

    const ContactPage = () => {
      const siteUrl = "https://www.tutornearby.co.uk";
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
            "name": "Contact Us",
            "item": `${siteUrl}/contact`
          }
        ]
      };

      return (
        <>
        <SeoMetaTags
          title="Contact TutorNearby UK - Enquire About Tutoring Services"
          description="Get in touch with TutorNearby for expert tutoring services in the UK. Ask questions, request a consultation, or start your learning journey today. We're here to help you succeed."
          keywords="contact tutoring UK, tutoring enquiry UK, academic support contact UK, TutorNearby contact, UK student support, find a tutor contact"
          ogTitle="Contact Us | TutorNearby UK Tutoring Services"
          ogDescription="Reach out to TutorNearby for personalized tutoring solutions across the UK. We're ready to answer your questions and guide you."
          ogImage={`${siteUrl}/assets/og-images/contact-og-image.png`} 
          ogUrl="/contact"
          canonicalUrl="/contact"
          schemaMarkup={breadcrumbSchema}
        />
        <div className="space-y-12 py-8 md:py-12 container mx-auto px-4">
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Mail className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions or ready to start your learning journey? Fill out the form below or contact us directly. We're here to help!
            </p>
          </motion.section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2 flex" 
            >
              <ContactForm className="flex-grow" /> 
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col space-y-8" 
            >
              <ContactInfo className="flex-grow" /> 
              <ComplaintsInfo className="flex-grow" /> 
            </motion.div>
          </div>
        </div>
        </>
      );
    };

    export default ContactPage;