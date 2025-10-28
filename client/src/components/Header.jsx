import React, { useState, useCallback } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen, Phone, MessageCircle, User, LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
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

const dropdownVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
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
        "text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
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

const UserDropdown = ({ user, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    onClose();
    toast.success("Logged out successfully");
    navigate("/login");
  }, [logout, onClose, navigate]);

  const getDashboardPath = () => {
    switch(user?.role) {
      case 'admin':
        return '/admin';
      case 'tutor':
        return '/tutor-dashboard';
      case 'student':
        return '/student-dashboard';
      case 'parent':
        return '/parent-dashboard';
      default:
        return '/profile';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 focus:outline-none"
        aria-label="User menu"
      >
        <img
          src={user.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover border-2 border-primary"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 mt-2 w-56 bg-background rounded-md shadow-lg py-1 z-50 border"
          >
            <div className="px-4 py-2 border-b">
              <p className="text-sm font-medium">{user.full_name || user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
            <Link
              to={getDashboardPath()}
              className="flex items-center px-4 py-2 text-sm hover:bg-accent w-full text-left"
              onClick={() => {
                setIsOpen(false);
                onClose();
              }}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
            {/* <Link
              to="/profile"
              className="flex items-center px-4 py-2 text-sm hover:bg-accent w-full text-left"
              onClick={() => {
                setIsOpen(false);
                onClose();
              }}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Link> */}
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm hover:bg-accent w-full text-left"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md dark:bg-background/60">
      <div className="container flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0"
          onClick={closeMobileMenu}
          aria-label="TutorNearby Homepage"
        >
          <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <span className="text-lg sm:text-xl lg:text-2xl font-bold gradient-text">TutorNearby</span>
        </Link>

        <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          {navLinksData.map((link) => (
            <NavItem
              key={link.to}
              to={link.to}
              text={link.text}
              aria={link.aria}
            />
          ))}
        </nav>

        <div className="hidden lg:flex items-center space-x-2 xl:space-x-3 flex-shrink-0">
          <Button variant="outline" size="sm" asChild className="hidden xl:flex">
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
          <Button size="sm" asChild className="whitespace-nowrap">
            <Link
              to="/contact"
              aria-label="Book a free consultation"
            >
              Free Consultation
            </Link>
          </Button>
          {user ? (
            <UserDropdown user={user} onClose={closeMobileMenu} />
          ) : (
            <Button size="sm" asChild>
              <Link to="/login" aria-label="Login">
                Login
              </Link>
            </Button>
          )}
        </div>

        <div className="lg:hidden flex-shrink-0 ml-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            aria-label={
              isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"
            }
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
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
            className="lg:hidden absolute top-16 sm:top-20 left-0 right-0 bg-background/95 dark:bg-background/90 shadow-lg p-4 sm:p-6 border-t"
            style={{ maxHeight: "calc(100vh - 64px)", overflowY: "auto" }}
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
                    Free Consultation
                  </Link>
                </Button>
              </motion.div>
              {user ? (
                <>
                  <motion.div variants={mobileLinkVariants} className="w-full">
                    <Link
                      to={user.role === 'admin' ? '/admin' : 
                          user.role === 'tutor' ? '/tutor-dashboard' : 
                          user.role === 'student' ? '/student-dashboard' : '/profile'}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:text-primary"
                      onClick={closeMobileMenu}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </motion.div>
                  <motion.div variants={mobileLinkVariants} className="w-full">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:text-primary"
                      onClick={closeMobileMenu}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </motion.div>
                  <motion.div variants={mobileLinkVariants} className="w-full">
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-sm font-medium hover:text-primary"
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                        toast.success("Logged out successfully");
                        navigate("/login");
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  variants={mobileLinkVariants}
                  className="w-full mt-2"
                >
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
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default React.memo(Header);