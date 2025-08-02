import React, { Suspense, lazy, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarDays, MapPin, PenTool, Landmark, BookOpen as MissingIcon, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { blogData } from '@/data/blogs';
import BlogContentRenderer from '@/components/blog/BlogContentRenderer';
import SeoMetaTags from '@/components/SeoMetaTags';

const FaqSection = lazy(() => import('@/components/blog/FaqSection'));

const defaultBlogContent = (slug) => ({
    title: `Insightful Article: ${slug.replace(/-/g, ' ')}`,
    date: "2025-01-01",
    location: "UK Wide",
    author: "TutorNearby Editorial Team",
    imageTag: "Abstract design representing interconnected knowledge streams and learning pathways, vibrant colors and dynamic lines, suitable for a very large, impressive blog header image",
    mainImageAlt: "Abstract educational concept illustration with dynamic lines",
    slug: slug,
    description: "In-depth content is currently being curated for this topic. Our experts are working diligently to bring you valuable insights on UK education and tutoring.",
    keywords: ["tutoring", "education", "academic support", "learning", "study skills", "UK education"],
    content: [
        { type: 'paragraph', text: `This section is a placeholder for the upcoming detailed blog post titled "${slug.replace(/-/g, ' ')}". Our team of subject matter experts and educational writers is working diligently to provide you with comprehensive insights, practical advice, and valuable information on this topic. Please check back soon for the full article.` },
        { type: 'image', imageTag: "Stylized open book with intricate, glowing geometric patterns and abstract symbols emanating from its pages, symbolizing the depth and complexity of knowledge and discovery", alt: "Symbolic open book glowing with intricate geometric patterns of knowledge", className: "image-large mx-auto my-12 rounded-lg shadow-xl aspect-[16/10] object-cover" },
        { type: 'paragraph', text: "We are passionately committed to delivering exceptionally high-quality, well-researched, and engaging articles covering a wide and diverse range of academic subjects, proven effective study strategies, and the latest news and updates about our tailored tutoring services available both in your local area and through our convenient online platforms. Stay tuned for enriching, informative, and inspiring content designed to support your educational journey!"}
    ]
});

const PageLoader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const BlogDetail = () => {
  const { slug } = useParams();
  const post = blogData[slug] || defaultBlogContent(slug);
  const siteUrl = "https://www.tutornearby.co.uk";
  
  const faqSectionData = post.content.find(item => item.type === 'faq_section');
  
  const schemaMarkup = useMemo(() => {
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "image": post.mainImageSrc ? `${siteUrl}${post.mainImageSrc.startsWith('/') ? post.mainImageSrc : '/' + post.mainImageSrc}` : `${siteUrl}/assets/TutorNearbySocialShare-BEc2r8ps.png`,
      "datePublished": post.date,
      "dateModified": post.date, 
      "author": {
        "@type": "Person",
        "name": post.author || "TutorNearby Editorial Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "TutorNearby",
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/assets/TutorNearbyLogo.png`
        }
      },
      "description": post.description,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${siteUrl}/blog/${post.slug}`
      }
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": siteUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blog",
          "item": `${siteUrl}/blog`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": post.title,
          "item": `${siteUrl}/blog/${post.slug}`
        }
      ]
    };

    let schemas = [articleSchema, breadcrumbSchema];

    if (faqSectionData && faqSectionData.faqs && faqSectionData.faqs.length > 0) {
      const faqPageSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqSectionData.faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer.replace(/<[^>]*>?/gm, '') 
          }
        }))
      };
      schemas.push(faqPageSchema);
    }
    return schemas;
  }, [post, faqSectionData, siteUrl]);


  if (!post) {
    return (
      <>
      <SeoMetaTags
        title="Blog Post Not Found"
        description="The blog post you are looking for could not be found."
        ogUrl={`/blog/${slug}`}
        canonicalUrl={`/blog/${slug}`}
      />
      <div className="text-center py-20 container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration: 0.5 }}>
          <MissingIcon className="w-28 h-28 text-destructive mx-auto mb-8"/>
          <h1 className="text-4xl md:text-5xl font-bold text-destructive mb-5">Blog Post Not Found</h1>
          <p className="text-muted-foreground text-lg md:text-xl my-8 max-w-2xl mx-auto">Oops! It seems the page you were looking for doesn't exist, has been moved, or the content is still under development. Please check the URL or navigate back to our main blog page.</p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
            <Link to="/blog" aria-label="Return to Blog Overview"><ArrowLeft className="mr-2.5 h-5 w-5" /> Return to Blog Overview</Link>
          </Button>
        </motion.div>
      </div>
      </>
    );
  }

  const ogImageForPost = post.mainImageSrc ? `${siteUrl}${post.mainImageSrc.startsWith('/') ? post.mainImageSrc : '/' + post.mainImageSrc}` : `${siteUrl}/assets/TutorNearbySocialShare-BEc2r8ps.png`;


  return (
    <>
    <SeoMetaTags
      title={post.title}
      description={post.description}
      keywords={Array.isArray(post.keywords) ? post.keywords.join(', ') : 'TutorNearby blog, UK education, tutoring advice'}
      ogTitle={post.title}
      ogDescription={post.description}
      ogImage={ogImageForPost}
      ogUrl={`/blog/${post.slug}`}
      canonicalUrl={`/blog/${post.slug}`}
      schemaMarkup={schemaMarkup}
    />
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "circOut" }}
      className="bg-background dark:bg-slate-900/50" 
    >
      <div className="mb-10 md:mb-14 max-w-full mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16">
        <div className="max-w-7xl mx-auto">
          <Button variant="outline" asChild className="hover:bg-primary/10 transition-colors group border-2 border-primary/60 hover:border-primary text-primary hover:text-primary/90 font-semibold py-3 px-6 text-base">
            <Link to="/blog" aria-label="Navigate back to blog overview page"><ArrowLeft className="mr-2.5 h-5 w-5 group-hover:-translate-x-1.5 transition-transform duration-200" /> Back to Blog Overview</Link>
          </Button>
        </div>
      </div>

      <article className="bg-card/90 dark:bg-card/95 shadow-2xl max-w-full mx-auto overflow-hidden sm:rounded-t-2xl glassmorphism">
        <header className="h-[300px] sm:h-[400px] md:h-[500px] lg:h-[550px] xl:h-[600px] w-full overflow-hidden shadow-2xl border-b-4 border-primary/40 dark:border-primary/60 group">
            <img        
                loading="eager"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
                alt={post.mainImageAlt || `Visual representation for blog post titled: ${post.title}`} 
                src={post.mainImageSrc || "https://images.unsplash.com/photo-1504983875-d3b163aba9e6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"} src="https://images.unsplash.com/photo-1504983875-d3b163aba9e6" />
        </header>
        
        <div className="max-w-7xl mx-auto p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold mb-10 md:mb-14 gradient-text text-center leading-snug tracking-tight break-words overflow-wrap-anywhere pb-2 pt-1.5">{post.title}</h1>
          
          <div className="flex flex-wrap items-center justify-center text-lg md:text-xl text-muted-foreground dark:text-slate-300 mb-14 md:mb-20 pb-12 border-b-2 border-border/80">
            <span className="flex items-center"><CalendarDays className="w-5 h-5 md:w-6 md:h-6 mr-2 text-primary" /> {post.date}</span>
            <span className="text-muted-foreground/70 mx-2 sm:mx-3">•</span>
            <span className="flex items-center"><Landmark className="w-5 h-5 md:w-6 md:h-6 mr-2 text-primary" /> {post.location}</span>
            <span className="text-muted-foreground/70 mx-2 sm:mx-3">•</span>
            <span className="flex items-center"><PenTool className="w-5 h-5 md:w-6 md:h-6 mr-2 text-primary" /> By {post.author}</span>
          </div>

          <div className="prose prose-xl dark:prose-invert max-w-none mx-auto text-foreground dark:text-slate-200">
            {post.content.filter(item => item.type !== 'faq_section' && item.type !== 'image').map((item, index) => (
              <BlogContentRenderer key={index} item={item} index={index} postTitle={post.title} />
            ))}
            {post.content.filter(item => item.type === 'image').map((item, index) => (
               <div key={`img-${index}`} className={item.className || "my-8 md:my-10"}>
                 <img 
                   loading="lazy"
                   className={`w-full h-auto object-cover rounded-lg shadow-lg ${item.aspectRatio ? `aspect-${item.aspectRatio}` : 'aspect-video' }`}
                   alt={item.alt || `Image related to ${post.title}`}
                   src={item.src} 
                  src="https://images.unsplash.com/photo-1618633566498-59d8e8c0e015" />
               </div>
            ))}
            {faqSectionData && faqSectionData.faqs && faqSectionData.faqs.length > 0 && (
              <Suspense fallback={<PageLoader />}>
                <FaqSection title={faqSectionData.title} faqs={faqSectionData.faqs} />
              </Suspense>
            )}
          </div>

          <div className="mt-24 md:mt-32 border-t-2 border-border/80 pt-16 md:pt-20 text-center bg-gradient-to-tr from-primary/10 via-transparent to-secondary/10 dark:from-primary/15 dark:via-transparent dark:to-secondary/15 p-10 md:p-16 rounded-xl shadow-inner">
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-10 gradient-text">Considering Tutoring in {post.location}?</h3>
            <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground dark:text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed hyphens-auto break-words overflow-wrap-anywhere">
              TutorNearby offers dedicated, expert {post.location === "UK Wide" || post.location === "Your City, UK" ? "" : `${post.location}-based`} tutors for a wide range of subjects and academic levels. 
              Receive personalized, one-on-one support to conquer challenges, boost your confidence, and achieve your academic aspirations.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="shadow-xl hover:shadow-primary/70 transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-primary via-purple-600 to-secondary hover:from-primary/90 hover:via-purple-600/90 hover:to-secondary/90 text-primary-foreground text-xl md:text-2xl px-12 py-8 rounded-lg"
            >
              <Link 
                to="/contact" 
                state={{ enquiryLocation: post.location, subjectQuery: `Enquiry regarding tutoring in ${post.location} after reading '${post.title}'` }}
                aria-label={`Discover ideal tutors in ${post.location}`}
              >
                Discover Your Ideal Tutor in {post.location} <ArrowRight className="ml-3.5 h-7 w-7" />
              </Link>
            </Button>
          </div>
        </div>
      </article>
    </motion.div>
    </>
  );
};

export default React.memo(BlogDetail);