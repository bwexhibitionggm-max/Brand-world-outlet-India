import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiUser3Line, RiMailLine, RiPhoneLine, RiCouponLine, RiCheckboxCircleLine } from 'react-icons/ri';
import CouponCard from './CouponCard';
import { generateCouponCode } from '../utils/couponGenerator';
import { GOOGLE_FORM_CONFIG } from '../config/googleForm';
import { parseEventEndDate } from '../utils/dateParser';

const Registration = ({ eventDetails, googleFormConfig }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    let targetDate = null;
    if (eventDetails?.timerTarget) {
      targetDate = new Date(eventDetails.timerTarget);
    } else if (eventDetails?.dates) {
      targetDate = parseEventEndDate(eventDetails.dates, eventDetails.timings);
    }

    if (!targetDate || isNaN(targetDate.getTime())) {
      targetDate = new Date('2026-06-25T10:00:00');
    }

    const checkExpiry = () => {
      const now = new Date();
      if (targetDate - now <= 0) {
        setIsExpired(true);
      } else {
        setIsExpired(false);
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, [eventDetails?.timerTarget, eventDetails?.dates, eventDetails?.timings]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear validation error on change
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', email: '', phone: '' };

    // Name Validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Indian Phone Validation (10 digits, starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Mobile number is required';
      isValid = false;
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Resolve form action and entry IDs from config or defaults
    const formActionUrl = googleFormConfig?.actionUrl || GOOGLE_FORM_CONFIG.actionUrl;
    const entryName = googleFormConfig?.entryName || GOOGLE_FORM_CONFIG.entries.name;
    const entryEmail = googleFormConfig?.entryEmail || GOOGLE_FORM_CONFIG.entries.email;
    const entryPhone = googleFormConfig?.entryPhone || GOOGLE_FORM_CONFIG.entries.phone;
    const entrySubsheet = googleFormConfig?.entrySubsheet || GOOGLE_FORM_CONFIG.entries.subsheet;
    const subsheetName = googleFormConfig?.subsheetName || '';

    try {
      // Create FormData to send to Google Form or Google Apps Script Web App
      const body = new URLSearchParams();
      const isGoogleWebApp = formActionUrl.includes('script.google.com');

      if (isGoogleWebApp) {
        body.append('name', formData.name);
        body.append('email', formData.email);
        body.append('phone', formData.phone);
        if (subsheetName) {
          body.append('subsheet', subsheetName);
        }
      } else {
        body.append(entryName, formData.name);
        body.append(entryEmail, formData.email);
        body.append(entryPhone, formData.phone);
        if (entrySubsheet && subsheetName) {
          body.append(entrySubsheet, subsheetName);
        }
      }

      // Perform no-cors post request
      await fetch(formActionUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });

      // After submission (no-cors resolved successfully, even if response is opaque)
      const generatedCode = generateCouponCode();
      const userPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        couponCode: generatedCode
      };

      setUserData(userPayload);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      // Fallback in case of absolute network failure: still generate a coupon on frontend
      const generatedCode = generateCouponCode();
      const userPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        couponCode: generatedCode
      };
      setUserData(userPayload);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="registration section-padding" id="register">
      <div className="registration__container container">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            /* Registration Form View */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -35 }}
              transition={{ duration: 0.5 }}
              className="registration__box"
            >
              {/* Box Heading */}
              <div className="registration__header">
                <div className="header-icon-wrapper">
                  <RiCouponLine className="header-icon" />
                </div>
                <h3>Claim Your Flat {eventDetails?.couponValue ? eventDetails.couponValue.replace(/\s*off/i, '').trim() : '₹500'} Voucher</h3>
                <p>Register below with your details. A unique discount coupon card will be generated for you instantly.</p>
              </div>

              {/* Form Element */}
              <form onSubmit={handleSubmit} className="registration__form">
                {/* Name Input */}
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <div className={`input-wrapper ${errors.name ? 'input-wrapper--error' : ''} ${isExpired ? 'input-wrapper--disabled' : ''}`}>
                    <RiUser3Line className="input-icon" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="e.g. Samarth Sharma"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isExpired}
                    />
                  </div>
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                {/* Email Input */}
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className={`input-wrapper ${errors.email ? 'input-wrapper--error' : ''} ${isExpired ? 'input-wrapper--disabled' : ''}`}>
                    <RiMailLine className="input-icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="e.g. samarth@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isExpired}
                    />
                  </div>
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                {/* Phone Input */}
                <div className="form-group">
                  <label htmlFor="phone">Mobile Number</label>
                  <div className={`input-wrapper ${errors.phone ? 'input-wrapper--error' : ''} ${isExpired ? 'input-wrapper--disabled' : ''}`}>
                    <RiPhoneLine className="input-icon" />
                    <span className="phone-prefix">+91</span>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      maxLength="10"
                      disabled={isExpired}
                    />
                  </div>
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                {/* Form Action */}
                <motion.div
                  whileHover={isExpired ? {} : { scale: 1.02 }}
                  whileTap={isExpired ? {} : { scale: 0.98 }}
                  className="form-submit-wrapper"
                >
                  <button
                    type="submit"
                    className="btn btn--submit"
                    disabled={isSubmitting || isExpired}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner"></span> Validating Details...
                      </>
                    ) : isExpired ? (
                      'Registration Closed'
                    ) : (
                      'Generate My Coupon'
                    )}
                  </button>
                </motion.div>
              </form>
            </motion.div>
          ) : (
            /* Success Display (Coupon generated successfully!) */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="registration__success"
            >
              {/* Success Badge Banner */}
              <div className="success-banner">
                <RiCheckboxCircleLine className="success-banner__icon" />
                <h3>Coupon Generated Successfully!</h3>
                <p>Your flat {eventDetails?.couponValue || '₹500 OFF'} pass is ready. Download it below to save it on your device.</p>
              </div>

              {/* Render the CouponCard component */}
              <CouponCard userData={userData} eventDetails={eventDetails} />
              
              {/* Option to generate another */}
              <button 
                className="btn-link-reset"
                onClick={() => {
                  setFormData({ name: '', email: '', phone: '' });
                  setIsSubmitted(false);
                  setUserData(null);
                }}
              >
                Register another person
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Registration;
