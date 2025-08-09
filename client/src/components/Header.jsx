import React, { useState, useCallback } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen, Phone, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinksData = [
  { to: "/", text: "Home", aria: "Navigate to Home page" },
  { to: "/subjects", text: "Subjects", aria: "Explore our tutoring subjects" },
  {
    to: "/pricing",
    text: "Pricing",
    aria: "View our tutoring prices and packages",
  },
  { to: "/blog", text: "Blog", aria: "Read our educational blog posts" },
  {
    to: "/contact",
    text: "Contact Us",
    aria: "Contact TutorNearby for enquiries",
  },
];

const mobileMenuVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

const mobileLinkVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

const whatsAppNumber = "07466436417";
const whatsAppURL = `https://wa.me/${whatsAppNumber.replace(
  /[^0-9]/g,
  ""
)}?text=Hello%20TutorNearby,%20I'd%20like%20to%20enquire%20about%20your%20services.`;

const NavItem = React.memo(({ to, text, onClick, aria }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "text-sm font-medium transition-colors hover:text-primary",
        isActive
          ? "text-primary font-semibold nav-link-active"
          : "text-foreground/70"
      )
    }
    onClick={onClick}
    aria-label={aria}
  >
    {text}
  </NavLink>
));

const MobileNavItem = React.memo(({ to, text, onClick, aria }) => (
  <motion.div variants={mobileLinkVariants}>
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "block py-2 text-base font-medium transition-colors hover:text-primary",
          isActive ? "text-primary font-semibold" : "text-foreground"
        )
      }
      onClick={onClick}
      aria-label={aria}
    >
      {text}
    </NavLink>
  </motion.div>
));

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md dark:bg-background/60">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link
          to="/"
          className="flex items-center space-x-2"
          onClick={closeMobileMenu}
          aria-label="TutorNearby Homepage"
        >
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold gradient-text">TutorNearby</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-10">
          {navLinksData.map((link) => (
            <NavItem
              key={link.to}
              to={link.to}
              text={link.text}
              aria={link.aria}
            />
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-3">
          <Button variant="outline" size="sm" asChild>
            <a
              href={whatsAppURL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
              aria-label="Chat with TutorNearby on WhatsApp"
            >
              <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
            </a>
          </Button>
          <Button size="sm" asChild>
            <Link to="/contact" className="" aria-label="Book a free consultation">
              Free Consultation
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/login" className="" aria-label="Login">
              Login
            </Link>
          </Button>

        </div>

        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            aria-label={
              isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"
            }
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden absolute top-20 left-0 right-0 bg-background/95 dark:bg-background/90 shadow-lg p-4 border-t"
            style={{ maxHeight: "calc(100vh - 80px)", overflowY: "auto" }}
          >
            <nav className="flex flex-col space-y-3">
              {navLinksData.map((link) => (
                <MobileNavItem
                  key={link.to}
                  to={link.to}
                  text={link.text}
                  onClick={closeMobileMenu}
                  aria={link.aria}
                />
              ))}
              <motion.div variants={mobileLinkVariants}>
                <Button variant="outline" className="w-full mt-2" asChild>
                  <a
                    href={whatsAppURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center"
                    aria-label="Chat with TutorNearby on WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                  </a>
                </Button>
              </motion.div>
              <motion.div variants={mobileLinkVariants}>
                <Button
                  className="w-full mt-2"
                  asChild
                  onClick={closeMobileMenu}
                >
                  <Link to="/contact" aria-label="Book a free consultation">
                    Free Consultat
                  </Link>
                </Button>
              </motion.div>
              <motion.div variants={mobileLinkVariants}>
                <Button
                  className="w-full mt-2"
                  asChild
                  onClick={closeMobileMenu}
                >
                  <Link to="/login" aria-label="Login">
                    Login
                  </Link>
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default React.memo(Header);
