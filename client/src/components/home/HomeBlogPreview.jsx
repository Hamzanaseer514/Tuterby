import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookText, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { blogData } from '@/data/blogData'; 

const HomeBlogPreview = () => {
  const featuredBlogs = React.useMemo(() => 
    Array.isArray(blogData) ? Object.values(blogData).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3) : [],
  []);


  const handleImageError = (e) => {
    e.target.src = 'https://source.unsplash.com/random/400x225?education,placeholder';
    e.target.alt = 'Placeholder image for blog post';
  };

  return (
    <section className="py-8 md:py-10 bg-background dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 md:mb-8"
        >
          <BookText className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-2" />
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Insights for a <span className="gradient-text">Brighter Future</span>
          </h2>
          <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our latest articles on study tips, exam strategies, and educational trends to help forge your path to success.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredBlogs.map((blog, index) => (
            <motion.div
              key={blog.slug || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="h-full"
            >
              <Link 
                to={`/blog/${blog.slug}`} 
                className="block h-full group" 
                aria-label={`Read the blog post titled: ${blog.title}`}
              >
                <div className="flex flex-col h-full shadow-xl rounded-xl overflow-hidden border border-border/70 bg-gradient-to-br from-card via-muted/10 to-card dark:from-slate-800 dark:via-slate-700/40 dark:to-slate-800 card-hover-effect group-hover:border-primary/50">
                  <div className="aspect-video bg-muted dark:bg-slate-700 overflow-hidden">
                    <img    
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      alt={blog.mainImageAlt || `Visual representation for blog post titled: ${blog.title}`} 
                      src={blog.mainImageSrc || "https://images.unsplash.com/photo-1504983875-d3b163aba9e6"}
                      onError={handleImageError} />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold leading-tight text-foreground mb-1 group-hover:text-primary transition-colors">{blog.title}</h3>
                    <p className="text-xs text-muted-foreground mb-1.5">{blog.date} • {blog.author}</p>
                    <p className="text-sm text-muted-foreground line-clamp-3 flex-grow mb-2.5">{blog.description}</p>
                    <div className="mt-auto">
                      <span className="text-primary text-sm font-semibold group-hover:underline">
                        Read More <ArrowRight className="inline-block ml-1 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8 md:mt-10">
          <Button size="lg" asChild className="group btn-primary-hover">
            <Link to="/blog" aria-label="Explore all blog posts and insights">
              Explore All Insights <Sparkles className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default React.memo(HomeBlogPreview);