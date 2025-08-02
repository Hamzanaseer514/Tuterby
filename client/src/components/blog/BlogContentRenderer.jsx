import React from 'react';
import { motion } from 'framer-motion';
import { Quote, BookOpen, Brain, Lightbulb, PenTool, Microscope, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';

const BlogContentRenderer = ({ item, index, postTitle }) => {

  const parseMarkdownLinks = (text) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const linkText = match[1];
      const url = match[2];
      const isExternal = url.startsWith('http://') || url.startsWith('https://');
      
      let ariaLabelText = linkText;
      if (!linkText || linkText.trim().toLowerCase() === 'click here' || linkText.trim().toLowerCase() === 'read more' || linkText.trim().toLowerCase() === 'learn more') {
        ariaLabelText = `Link to ${url.startsWith('/') ? url.substring(1).replace(/-/g, ' ') : 'external resource'}`;
      }

      const ariaLabel = isExternal 
        ? `Visit external link for ${ariaLabelText} (opens in new tab)` 
        : `Learn more about ${ariaLabelText}`;

      if (isExternal) {
        parts.push(<a key={`${index}-${lastIndex}-link`} href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" aria-label={ariaLabel}>{linkText}</a>);
      } else {
        parts.push(<Link key={`${index}-${lastIndex}-link`} to={url} className="text-primary hover:underline" aria-label={ariaLabel}>{linkText}</Link>);
      }
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts;
  };


  switch (item.type) {
    case 'heading':
      const Tag = `h${item.level}`;
      const iconSize = item.level === 2 ? 30 : item.level === 3 ? 26 : 22;
      const iconProps = { className: "inline-block mr-3 text-primary shrink-0", size: iconSize, strokeWidth: 2.5 };
      let IconComponent;
      if (item.level === 2) IconComponent = BookOpen;
      else if (item.level === 3) IconComponent = Brain;
      else if (item.level === 4) IconComponent = Microscope;
      else IconComponent = Lightbulb;

      return (
        <div key={index} className="heading-card clear-both my-10 md:my-12">
          <Tag className={`${item.level === 2 ? 'text-3xl md:text-4xl lg:text-4xl' : item.level === 3 ? 'text-2xl md:text-3xl lg:text-3xl' : 'text-xl md:text-2xl lg:text-2xl'} font-semibold gradient-text flex items-center`}>
           <IconComponent {...iconProps} /> <span className="flex-grow break-words overflow-wrap-anywhere">{item.text}</span>
          </Tag>
        </div>
      );
    case 'paragraph':
      return <p key={index} className="my-6 md:my-7 leading-relaxed md:leading-loose text-lg md:text-xl lg:text-[1.3rem] text-foreground/90 dark:text-foreground/85 text-justify hyphens-auto overflow-wrap-break-word">{parseMarkdownLinks(item.text)}</p>;
    case 'list':
      return (
        <ul key={index} className="list-disc list-outside my-6 md:my-7 space-y-3.5 pl-12 text-lg md:text-xl lg:text-[1.3rem] text-foreground/90 dark:text-foreground/85 clear-both">
          {item.items.map((li, i) => <li key={i} className="mb-3 pl-2.5 break-words overflow-wrap-anywhere">{parseMarkdownLinks(li)}</li>)}
        </ul>
      );
    case 'quote':
      return (
        <blockquote key={index} className="my-12 md:my-16 p-8 md:p-10 border-l-[12px] border-primary bg-muted/80 dark:bg-slate-800/70 text-xl md:text-2xl rounded-r-xl shadow-xl relative overflow-hidden clear-both">
          <Quote className="absolute top-4 right-4 md:top-6 md:right-6 w-14 h-14 md:w-20 md:h-20 text-primary/10 dark:text-primary/5 transform " />
          <p className="mb-5 relative z-10 italic font-medium text-foreground/95 dark:text-foreground/90 break-words overflow-wrap-anywhere">{parseMarkdownLinks(item.text)}</p>
          {item.cite && <footer className="text-lg md:text-xl mt-5 text-muted-foreground dark:text-slate-400 relative z-10 break-words overflow-wrap-anywhere">- {item.cite}</footer>}
        </blockquote>
      );
    case 'image':
      return (
        <div key={index} className={item.className || "my-8 md:my-10"}>
          <img 
            loading="lazy"
            className={`w-full h-auto object-cover rounded-lg shadow-lg ${item.aspectRatio ? `aspect-${item.aspectRatio}` : 'aspect-video' }`}
            alt={item.alt || `Image related to ${postTitle}`}
            src={item.src} 
            src="https://images.unsplash.com/photo-1587645663324-d7fc65590f25" />
        </div>
      );
    default:
      return null;
  }
};

export default React.memo(BlogContentRenderer);