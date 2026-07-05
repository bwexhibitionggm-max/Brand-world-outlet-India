import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiCalendarEventLine, RiMapPin2Line, RiTimeLine } from 'react-icons/ri';
import Logo from './Logo';
import { parseEventEndDate } from '../utils/dateParser';

const Hero = ({ eventDetails }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  const getCityName = (venue) => {
    if (!venue) return 'Bhopal';
    const parts = venue.trim().split(/\s+/);
    return parts[parts.length - 1];
  };

  const fallbackTitle = `${getCityName(eventDetails?.venue)}’s Biggest <br /> <span class="text-gold">Summer Fashion</span> Sale`;

  // Countdown timer logic (targeting configured event date)
  useEffect(() => {
    let targetDate = null;
    if (eventDetails.timerTarget) {
      targetDate = new Date(eventDetails.timerTarget);
    } else if (eventDetails.dates) {
      targetDate = parseEventEndDate(eventDetails.dates, eventDetails.timings);
    }

    if (!targetDate || isNaN(targetDate.getTime())) {
      targetDate = new Date('2026-06-25T10:00:00');
    }
    
    const calculateTime = () => {
      const now = new Date();
      const difference = targetDate - now;
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      
      setTimeLeft({ days, hours, minutes, seconds });
      setIsExpired(false);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [eventDetails.timerTarget, eventDetails.dates, eventDetails.timings]);


  const handleCTAClick = (e) => {
    e.preventDefault();
    const registerSection = document.querySelector('#register');
    if (registerSection) {
      const offset = 80;
      const targetPosition = registerSection.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="hero" id="top">
      {/* Background Overlay */}
      <div className="hero__bg">
        <div className="hero__bg-overlay"></div>
      </div>

      <div className="hero__container container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="hero__content"
        >
          {/* Logo Crest */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="hero__logo-wrapper"
          >
            <Logo size={110} className="hero__logo" />
          </motion.div>

          <span className="hero__badge">{eventDetails.bannerText}</span>

          {/* Heading */}
          <h1 
            className="hero__title"
            dangerouslySetInnerHTML={{ 
              __html: eventDetails.title || fallbackTitle 
            }}
          />

          {/* Subheading */}
          <p className="hero__subtitle">
            {eventDetails.subheading}
          </p>

          {/* Countdown timer */}
          <div className="hero__countdown">
            <div className="countdown-box">
              <span className="countdown-box__num">{String(timeLeft.days).padStart(2, '0')}</span>
              <span className="countdown-box__label">Days</span>
            </div>
            <div className="countdown-divider">:</div>
            <div className="countdown-box">
              <span className="countdown-box__num">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="countdown-box__label">Hours</span>
            </div>
            <div className="countdown-divider">:</div>
            <div className="countdown-box">
              <span className="countdown-box__num">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="countdown-box__label">Min</span>
            </div>
            <div className="countdown-divider">:</div>
            <div className="countdown-box">
              <span className="countdown-box__num">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="countdown-box__label">Sec</span>
            </div>
          </div>

          {/* CTA */}
          <motion.div
            whileHover={isExpired ? {} : { scale: 1.05 }}
            whileTap={isExpired ? {} : { scale: 0.95 }}
            className="hero__cta-wrapper"
          >
            {isExpired ? (
              <span className="hero__cta btn btn--primary btn--disabled">
                Registration Closed
              </span>
            ) : (
              <a href="#register" className="hero__cta btn btn--primary" onClick={handleCTAClick}>
                Get My Flat {eventDetails?.couponValue ? eventDetails.couponValue.replace(/\s*off/i, '').trim() : '₹500'} Coupon
              </a>
            )}
          </motion.div>
        </motion.div>

        {/* Details Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="hero__details-grid"
        >
          <div className="hero-detail-card">
            <RiCalendarEventLine className="hero-detail-card__icon" />
            <div className="hero-detail-card__text">
              <h4>Event Dates</h4>
              <p>{eventDetails.dates}</p>
            </div>
          </div>

          <div 
            className={`hero-detail-card ${eventDetails.locationLink ? 'hero-detail-card--clickable' : ''}`}
            onClick={() => {
              if (eventDetails.locationLink) {
                window.open(eventDetails.locationLink, '_blank', 'noopener,noreferrer');
              }
            }}
          >
            <RiMapPin2Line className="hero-detail-card__icon" />
            <div className="hero-detail-card__text">
              <h4>Venue</h4>
              <p>{eventDetails.venue}</p>
              {eventDetails.locationLink && (
                <span className="view-map-link">View on Map →</span>
              )}
            </div>
          </div>

          <div className="hero-detail-card">
            <RiTimeLine className="hero-detail-card__icon" />
            <div className="hero-detail-card__text">
              <h4>Timings</h4>
              <p>{eventDetails.timings}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
