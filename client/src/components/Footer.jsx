import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin, Shield, Lock, HelpCircle } from 'lucide-react';
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const localSeoLinks = React.useMemo(() => [{
    name: "Tutors in Manchester",
    path: "/blog/top-tutors-manchester",
    aria: "Find tutors in Manchester via our blog"
  }, {
    name: "Tutors in Liverpool",
    path: "/blog/a-level-maths-liverpool",
    aria: "Find tutors in Liverpool via our blog"
  }, {
    name: "Tutors in London",
    path: "/blog/gcse-science-london",
    aria: "Find tutors in London via our blog"
  }, {
    name: "Tutors in Edinburgh",
    path: "/blog/university-applications-edinburgh",
    aria: "Find tutors in Edinburgh via our blog"
  }, {
    name: "Tutors in Bath",
    path: "/blog/choosing-a-level-subjects-bath",
    aria: "Find tutors in Bath via our blog"
  }, {
    name: "Tutors in Newcastle",
    path: "/blog/computer-science-tutoring-newcastle",
    aria: "Find tutors in Newcastle via our blog"
  }, {
    name: "Tutors in Birmingham",
    path: "/blog/tutoring-services-birmingham",
    aria: "Find tutors in Birmingham via our blog"
  }, {
    name: "Tutors in Leeds",
    path: "/blog/find-tutors-leeds",
    aria: "Find tutors in Leeds via our blog"
  }, {
    name: "Tutors in Glasgow",
    path: "/blog/academic-support-glasgow",
    aria: "Find tutors in Glasgow via our blog"
  }, {
    name: "Tutors in Sheffield",
    path: "/blog/expert-tuition-sheffield",
    aria: "Find tutors in Sheffield via our blog"
  }, {
    name: "Tutors in Bradford",
    path: "/blog/tutoring-options-bradford",
    aria: "Find tutors in Bradford via our blog"
  }, {
    name: "Tutors in Bristol",
    path: "/blog/bristol-tutors-guide",
    aria: "Find tutors in Bristol via our blog"
  }, {
    name: "Tutors in Cardiff",
    path: "/blog/tutoring-services-cardiff",
    aria: "Find tutors in Cardiff via our blog"
  }, {
    name: "Tutors in Nottingham",
    path: "/blog/find-tutors-nottingham",
    aria: "Find tutors in Nottingham via our blog"
  }, {
    name: "Tutors in Southampton",
    path: "/blog/academic-support-southampton",
    aria: "Find tutors in Southampton via our blog"
  }, {
    name: "Tutors in Leicester",
    path: "/blog/expert-tuition-leicester",
    aria: "Find tutors in Leicester via our blog"
  }, {
    name: "Tutors in Coventry",
    path: "/blog/tutoring-options-coventry",
    aria: "Find tutors in Coventry via our blog"
  }, {
    name: "Tutors in Reading",
    path: "/blog/reading-tutors-guide",
    aria: "Find tutors in Reading via our blog"
  }, {
    name: "Tutors in Oxford",
    path: "/blog/oxford-academic-excellence",
    aria: "Find tutors in Oxford via our blog"
  }, {
    name: "Tutors in Cambridge",
    path: "/blog/cambridge-tutoring-support",
    aria: "Find tutors in Cambridge via our blog"
  }, {
    name: "Tutors in York",
    path: "/blog/tutoring-york",
    aria: "Find tutors in York via our blog"
  }, {
    name: "Tutors in Brighton",
    path: "/blog/tutoring-brighton",
    aria: "Find tutors in Brighton via our blog"
  }, {
    name: "Tutors in Plymouth",
    path: "/blog/tutoring-plymouth",
    aria: "Find tutors in Plymouth via our blog"
  }, {
    name: "Tutors in Derby",
    path: "/blog/tutoring-derby",
    aria: "Find tutors in Derby via our blog"
  }, {
    name: "Tutors in Wolverhampton",
    path: "/blog/tutoring-wolverhampton",
    aria: "Find tutors in Wolverhampton via our blog"
  }, {
    name: "Tutors in Stoke-on-Trent",
    path: "/blog/tutoring-stoke",
    aria: "Find tutors in Stoke-on-Trent via our blog"
  }, {
    name: "Tutors in Hull",
    path: "/blog/tutoring-hull",
    aria: "Find tutors in Hull via our blog"
  }, {
    name: "Tutors in Preston",
    path: "/blog/tutoring-preston",
    aria: "Find tutors in Preston via our blog"
  }, {
    name: "Tutors in Norwich",
    path: "/blog/tutoring-norwich",
    aria: "Find tutors in Norwich via our blog"
  }, {
    name: "Tutors in Exeter",
    path: "/blog/tutoring-exeter",
    aria: "Find tutors in Exeter via our blog"
  }], []);
  const footerNavLinks = React.useMemo(() => [{
    to: '/subjects',
    text: 'Subjects',
    aria: 'Explore our tutoring subjects'
  }, {
    to: '/pricing',
    text: 'Pricing',
    aria: 'View our tutoring prices and packages'
  }, {
    to: '/blog',
    text: 'Blog',
    aria: 'Read our educational blog posts'
  }, {
    to: '/contact',
    text: 'Contact',
    aria: 'Contact TutorNearby for enquiries'
  }, {
    to: '/blog/exam-help-smart-preparation',
    text: 'Exam Preparation Tips',
    icon: <HelpCircle className="h-4 w-4 mr-1.5 inline-block" />,
    aria: 'Get exam preparation tips from our blog'
  }, {
    to: '/terms-and-conditions',
    text: 'Terms & Conditions',
    icon: <Shield className="h-4 w-4 mr-1.5 inline-block" />,
    aria: 'Read our Terms and Conditions'
  }, {
    to: '/privacy-policy',
    text: 'Privacy Policy',
    icon: <Lock className="h-4 w-4 mr-1.5 inline-block" />,
    aria: 'Read our Privacy Policy'
  }], []);
  const whatsAppNumber = "07466436417";
  const whatsAppURL = `https://wa.me/${whatsAppNumber.replace(/[^0-9]/g, '')}`;
  const headOfficeAddress = "Unit 1, Parliament Business Centre, Commerce Way, Liverpool, L8 7BL";
  return <footer className="bg-muted dark:bg-slate-800 text-muted-foreground dark:text-slate-400 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4" aria-label="TutorNearby Homepage">
              <BookOpen className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold text-foreground dark:text-white">TutorNearby</span>
            </Link>
            <p className="text-sm">
              Providing expert tutoring for GCSE, A-Levels, and Undergraduate students across the UK. Online and in-person options available.
            </p>
          </div>

          <div>
            <p className="font-semibold text-foreground dark:text-white mb-3">Quick Links</p>
            <ul className="space-y-2">
              {footerNavLinks.map(link => <li key={link.to}>
                  <Link to={link.to} className="text-sm hover:text-primary transition-colors flex items-center" aria-label={link.aria}>
                    {link.icon && link.icon}
                    {link.text}
                  </Link>
                </li>)}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-foreground dark:text-white mb-3">Contact Us</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-primary" />
                <a href="mailto:info@tutornearby.co.uk" className="hover:text-primary transition-colors" aria-label="Email TutorNearby at info@tutornearby.co.uk">info@tutornearby.co.uk</a>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-primary" />
                <a href={whatsAppURL} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" aria-label={`WhatsApp TutorNearby at ${whatsAppNumber}`}>
                   {whatsAppNumber} (WhatsApp)
                </a>
              </li>
              <li className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 text-primary mt-1 flex-shrink-0" />
                <div>
                  <span>Online Tutoring UK Wide.</span>
                  <br />
                  <span>Head Office: {headOfficeAddress}</span>
                  <br />
                  <span className="text-xs"></span>
                </div>
              </li>
            </ul>
          </div>
          
          <div>
            <p className="font-semibold text-foreground dark:text-white mb-3">Find Tutors Locally</p>
            <div className="max-h-48 overflow-y-auto custom-scrollbar">
              <ul className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                {localSeoLinks.map(link => <li key={link.path} className="py-1">
                    <Link to={link.path} className="hover:text-primary transition-colors" aria-label={link.aria}>
                      {link.name}
                    </Link>
                  </li>)}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-border dark:border-slate-700 pt-8 text-center text-sm">
          <p>&copy; {currentYear} TutorNearby. All rights reserved.</p>
          <p className="mt-1">A Product of Laskon Technologies</p>
        </div>
      </div>
    </footer>;
};
export default React.memo(Footer);