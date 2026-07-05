import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import Logo from './Logo';
import '../styles/main.scss';

const Navbar = ({ onTriggerAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Highlights', href: '#highlights' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Get Coupon', href: '#register', isCTA: true }
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setIsOpen(false);
    const targetElement = document.querySelector(href);
    if (targetElement) {
      const offset = 80; // height of the navbar
      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleBrandClick = (e) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastClickTimeRef.current < 1000) {
      clickCountRef.current += 1;
      if (clickCountRef.current >= 5) {
        onTriggerAdmin();
        clickCountRef.current = 0; // Reset click counter
      }
    } else {
      clickCountRef.current = 1;
    }
    lastClickTimeRef.current = now;
    handleLinkClick(e, '#top');
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__container container">
          {/* Logo Brand (Click 5 times for Admin panel) */}
          <a href="#" className="navbar__brand" onClick={handleBrandClick}>
            <Logo size={42} className="navbar__logo" />
            <div className="navbar__brand-text">
              <span className="navbar__brand-title">BW</span>
              <span className="navbar__brand-subtitle">Exhibition</span>
            </div>
          </a>

          {/* Desktop Menu */}
          <div className="navbar__menu navbar__menu--desktop">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={link.isCTA ? 'navbar__cta' : 'navbar__link'}
                onClick={(e) => handleLinkClick(e, link.href)}
              >
                {link.isCTA ? (
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {link.name}
                  </motion.span>
                ) : (
                  <span>{link.name}</span>
                )}
              </a>
            ))}
          </div>

          {/* Mobile Hamburguer Toggle */}
          <button
            className="navbar__toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <RiCloseLine size={28} /> : <RiMenu3Line size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="navbar__mobile-drawer"
          >
            <div className="navbar__mobile-links">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={link.isCTA ? 'navbar__mobile-cta' : 'navbar__mobile-link'}
                  onClick={(e) => handleLinkClick(e, link.href)}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
