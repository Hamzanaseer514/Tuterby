import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, MapPin, BookOpen, Search, X } from 'lucide-react';
import { blogData } from '@/data/blogs';
import SeoMetaTags from '@/components/SeoMetaTags';

const BlogsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState([]);

  const allBlogs = useMemo(() => 
    Object.values(blogData).sort((a, b) => new Date(b.date) - new Date(a.date)),
  []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredBlogs(allBlogs);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const results = allBlogs.filter(blog => {
      const titleMatch = blog.title?.toLowerCase().includes(lowerSearchTerm);
      const descriptionMatch = blog.description?.toLowerCase().includes(lowerSearchTerm);
      const locationMatch = blog.location?.toLowerCase().includes(lowerSearchTerm);
      const tagsMatch = Array.isArray(blog.tags) && blog.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm));
      const contentMatch = Array.isArray(blog.content) && blog.content.some(item => {
        if (item.type === 'paragraph' || item.type === 'heading') {
          return item.text?.toLowerCase().includes(lowerSearchTerm);
        }
        if (item.type === 'list') {
          return Array.isArray(item.items) && item.items.some(listItem => listItem?.toLowerCase().includes(lowerSearchTerm));
        }
        return false;
      });
      
      return titleMatch || descriptionMatch || locationMatch || tagsMatch || contentMatch;
    });
    setFilteredBlogs(results);
  }, [searchTerm, allBlogs]);

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
        "name": "Blog",
        "item": `${siteUrl}/blog`
      }
    ]
  };

  return (
    <>
    <SeoMetaTags
      title="TutorNearby Blog - Insights, Tips & Tutoring News UK"
      description="Explore TutorNearby's blog for expert articles on UK education, tutoring strategies, exam preparation for GCSE & A-Levels, local SEO for learning, and academic success stories across the UK."
      keywords="education blog UK, tutoring tips, exam preparation UK, GCSE help, A-Level advice, academic success UK, UK tutoring news, learning strategies, TutorNearby blog, search blog"
      ogTitle="TutorNearby UK Blog | Expert Educational Articles"
      ogDescription="Stay informed with the latest insights and advice on tutoring and academic achievement in the UK from TutorNearby."
      ogImage={`${siteUrl}/assets/og-images/blog-overview-og-image.png`} 
      ogUrl="/blog"
      canonicalUrl="/blog"
      schemaMarkup={breadcrumbSchema}
    />
    <div className="space-y-12 container mx-auto px-4 py-8">
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-10"
      >
        <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          TutorNearby <span className="gradient-text">Blog</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          In-depth insights, local SEO strategies, and expert advice on education, tutoring, and academic success across the UK. Stay informed with our latest articles.
        </p>
      </motion.section>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 max-w-xl mx-auto"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search blog posts by keyword, title, topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 py-3 text-base rounded-full shadow-md focus:ring-2 focus:ring-primary/80"
            aria-label="Search blog posts"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search term"
            >
              <X className="h-5 w-5 text-muted-foreground hover:text-destructive" />
            </Button>
          )}
        </div>
      </motion.div>

      {filteredBlogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="flex"
              viewport={{ once: true }}
            >
              <Card className="flex flex-col w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 glassmorphism hover:border-primary/50 border border-transparent">
                <Link 
                  to={`/blog/${post.slug}`} 
                  className="block h-48 w-full overflow-hidden aspect-video" 
                  aria-label={`Read more about the blog post titled: ${post.title}`}
                >
                  <img        
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    alt={post.mainImageAlt || `Visual representation for blog post titled: ${post.title}`} 
                    src={post.mainImageSrc || post.image || "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80"} src="https://images.unsplash.com/photo-1504983875-d3b163aba9e6" />
                </Link>
                <CardHeader>
                  <CardTitle className="text-xl hover:text-primary transition-colors">
                    <Link to={`/blog/${post.slug}`} aria-label={`Read blog post titled: ${post.title}`}>{post.title}</Link>
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center"><CalendarDays className="w-3.5 h-3.5 mr-1 text-primary/80" /> {post.date}</span>
                    <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-primary/80" /> {post.location}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription>{post.description}</CardDescription>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="link" 
                    asChild 
                    className="p-0 text-primary hover:text-secondary transition-colors" 
                  >
                    <Link to={`/blog/${post.slug}`} aria-label={`Read more about the blog post titled: ${post.title}`}>
                      Read More <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16"
        >
          <Search className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-2xl font-semibold mb-3">No Blog Posts Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            We couldn't find any blog posts matching your search criteria "{searchTerm}". Try different keywords or clear the search to see all posts.
          </p>
          <Button onClick={() => setSearchTerm('')} variant="outline" className="mt-6">
            Clear Search & View All Posts
          </Button>
        </motion.div>
      )}
    </div>
    </>
  );
};

export default React.memo(BlogsPage);