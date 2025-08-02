import React from 'react';
import { Helmet } from 'react-helmet-async';

const SeoMetaTags = ({ 
  title, 
  description, 
  ogTitle, 
  ogDescription, 
  ogImage,
  ogUrl,
  canonicalUrl,
  keywords,
  schemaMarkup 
}) => {
  const defaultTitle = "TutorNearby - Expert GCSE, A-Level & Undergraduate Tutoring UK";
  const defaultDescription = "Expert online and in-person tutoring for GCSE, A-Level, and Undergraduate students across the UK. Personalised lessons, exam preparation, and premium mentorship programmes.";
  const siteUrl = "https://www.tutornearby.co.uk"; 
  const defaultOgImage = `${siteUrl}/assets/TutorNearbySocialShare-BEc2r8ps.png`;
  const organizationName = "TutorNearby";
  const organizationLogo = `${siteUrl}/assets/TutorNearbyLogo.png`; 

  const currentTitle = title ? `${title} | TutorNearby` : defaultTitle;
  const currentDescription = description || defaultDescription;
  const currentOgTitle = ogTitle || currentTitle;
  const currentOgDescription = ogDescription || currentDescription;
  const currentOgImage = ogImage || defaultOgImage;
  
  let currentOgUrl;
  if (ogUrl === '/') {
    currentOgUrl = siteUrl;
  } else if (ogUrl) {
    currentOgUrl = `${siteUrl}${ogUrl.startsWith('/') ? ogUrl : '/' + ogUrl}`;
  } else {
    currentOgUrl = siteUrl;
  }
  
  let finalCanonicalUrl;
  if (canonicalUrl === '/') {
    finalCanonicalUrl = siteUrl;
  } else if (canonicalUrl) {
    finalCanonicalUrl = `${siteUrl}${canonicalUrl.startsWith('/') ? canonicalUrl : '/' + canonicalUrl}`;
  } else if (ogUrl === '/') {
    finalCanonicalUrl = siteUrl;
  } else if (ogUrl) {
    finalCanonicalUrl = `${siteUrl}${ogUrl.startsWith('/') ? ogUrl : '/' + ogUrl}`;
  } else {
    finalCanonicalUrl = siteUrl;
  }


  const defaultOrganizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": organizationName,
    "url": siteUrl,
    "logo": organizationLogo,
    "sameAs": [
    ]
  };

  const generatedSchemaMarkup = schemaMarkup ? (Array.isArray(schemaMarkup) ? schemaMarkup : [schemaMarkup]) : [];
  
  const combinedSchema = [defaultOrganizationSchema, ...generatedSchemaMarkup.filter(s => s && Object.keys(s).length > 0)];


  return (
      <Helmet>
        <title>{currentTitle}</title>
        <meta name="description" content={currentDescription} />
        {keywords && <meta name="keywords" content={keywords} />}
        
        <meta property="og:title" content={currentOgTitle} />
        <meta property="og:description" content={currentOgDescription} />
        <meta property="og:image" content={currentOgImage} />
        <meta property="og:url" content={currentOgUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={organizationName} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={currentOgTitle} />
        <meta name="twitter:description" content={currentOgDescription} />
        <meta name="twitter:image" content={currentOgImage} />
        
        <link rel="canonical" href={finalCanonicalUrl} />

        {combinedSchema.map((schema, index) => (
          schema && Object.keys(schema).length > 0 && (
            <script key={`schema-${index}`} type="application/ld+json">
              {JSON.stringify(schema)}
            </script>
          )
        ))}
      </Helmet>
  );
};

export default React.memo(SeoMetaTags);