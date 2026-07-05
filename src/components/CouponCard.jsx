import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { toJpeg } from 'html-to-image';
import { RiDownloadLine, RiCheckDoubleLine, RiCalendarCheckLine, RiMapPinUserLine } from 'react-icons/ri';
import Logo from './Logo';
const CouponCard = ({ userData, eventDetails }) => {
  const couponRef = useRef(null);
  const printRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
 
  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
 
    try {
      const element = printRef.current;
      if (!element) return;
 
      // Configuration for high-res JPEG output (600x270 aspect ratio)
      const options = {
        quality: 0.95, // High image quality
        backgroundColor: '#0a0a0a', // Solid black back to avoid bleeding
        width: 600, // Force canvas width to 600px
        height: 270, // Force canvas height to 270px
        pixelRatio: 3, // High DPI rendering (scales resolution by 3x)
      };
 
      const dataUrl = await toJpeg(element, options);
      
      const link = document.createElement('a');
      link.download = `BW_EXHIBITION_COUPON_${userData.couponCode}.jpeg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting coupon image:', error);
    } finally {
      setDownloading(false);
    }
  };
 
  return (
    <div className="coupon-download-section">
      {/* Printable Coupon Container wrapper (Visible on UI, responsive) */}
      <div className="coupon-card-capture-area">
        <div className="coupon-card" ref={couponRef}>
          {/* Decorative radial gradients for card */}
          <div className="coupon-card__glow"></div>
          <div className="coupon-card__diagonal-line"></div>
 
          {/* Left Ribbon / Value Area */}
          <div className="coupon-card__left">
            <span className="coupon-card__event-type">EXCLUSIVE VOUCHER</span>
            <h2 className="coupon-card__value">{eventDetails?.couponValue ? eventDetails.couponValue.replace(/\s*off/i, '').trim() : '₹500'}</h2>
            <span className="coupon-card__off">FLAT OFF</span>
            <div className="coupon-card__dashed-vertical"></div>
          </div>
 
          {/* Right Main Info Area */}
          <div className="coupon-card__right">
            {/* Header branding */}
            <div className="coupon-card__header">
              <Logo size={48} className="coupon-card__logo" />
              <div className="coupon-card__brand-text">
                <span className="coupon-card__title">BW EXHIBITION</span>
                <span className="coupon-card__subtitle">INDIA</span>
              </div>
            </div>
 
            {/* Event Specifics */}
            <div className="coupon-card__details">
              <div className="detail-item">
                <RiCalendarCheckLine className="detail-item__icon" />
                <span>{eventDetails.dates}</span>
              </div>
              <div className="detail-item">
                <RiMapPinUserLine className="detail-item__icon" />
                <span>{eventDetails.venue}</span>
              </div>
            </div>
 
            {/* User credentials */}
            <div className="coupon-card__holder">
              <span className="holder-label">REDEEMABLE BY</span>
              <span className="holder-name">{userData.name}</span>
              <span className="holder-phone">+91 {userData.phone}</span>
            </div>
 
            {/* Code Highlight */}
            <div className="coupon-card__code-container">
              <span className="code-label">COUPON CODE</span>
              <div className="code-value">{userData.couponCode}</div>
              <span className="code-validity">{eventDetails.couponValidity}</span>
            </div>
          </div>
          
          {/* Card Border Rings on top/bottom cuts */}
          <div className="coupon-card__notch coupon-card__notch--top"></div>
          <div className="coupon-card__notch coupon-card__notch--bottom"></div>
        </div>
      </div>
 
      {/* Hidden duplicate card for high-res unconstrained rendering (Only used for download) */}
      <div 
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: '-9999px',
          width: '600px',
          height: '270px',
          overflow: 'hidden',
          pointerEvents: 'none'
        }}
      >
        <div className="coupon-card coupon-card--printable" ref={printRef}>
          <div className="coupon-card__glow"></div>
          <div className="coupon-card__diagonal-line"></div>
 
          <div className="coupon-card__left">
            <span className="coupon-card__event-type">EXCLUSIVE VOUCHER</span>
            <h2 className="coupon-card__value">{eventDetails?.couponValue ? eventDetails.couponValue.replace(/\s*off/i, '').trim() : '₹500'}</h2>
            <span className="coupon-card__off">FLAT OFF</span>
            <div className="coupon-card__dashed-vertical"></div>
          </div>
 
          <div className="coupon-card__right">
            <div className="coupon-card__header">
              <Logo size={48} className="coupon-card__logo" />
              <div className="coupon-card__brand-text">
                <span className="coupon-card__title">BW EXHIBITION</span>
                <span className="coupon-card__subtitle">INDIA</span>
              </div>
            </div>
 
            <div className="coupon-card__details">
              <div className="detail-item">
                <RiCalendarCheckLine className="detail-item__icon" />
                <span>{eventDetails.dates}</span>
              </div>
              <div className="detail-item">
                <RiMapPinUserLine className="detail-item__icon" />
                <span>{eventDetails.venue}</span>
              </div>
            </div>
 
            <div className="coupon-card__holder">
              <span className="holder-label">REDEEMABLE BY</span>
              <span className="holder-name">{userData.name}</span>
              <span className="holder-phone">+91 {userData.phone}</span>
            </div>
 
            <div className="coupon-card__code-container">
              <span className="code-label">COUPON CODE</span>
              <div className="code-value">{userData.couponCode}</div>
              <span className="code-validity">{eventDetails.couponValidity}</span>
            </div>
          </div>
          
          <div className="coupon-card__notch coupon-card__notch--top"></div>
          <div className="coupon-card__notch coupon-card__notch--bottom"></div>
        </div>
      </div>
 
      {/* Action CTA Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="coupon-download-btn-wrapper"
      >
        <button
          className="btn btn--download"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? (
            <>
              <span className="spinner"></span> Generating Image...
            </>
          ) : (
            <>
              <RiDownloadLine size={20} /> Download Coupon
            </>
          )}
        </button>
      </motion.div>
 
      {/* Instructions */}
      <p className="coupon-download-instructions">
        <RiCheckDoubleLine className="check-icon" /> Please present this downloaded coupon card at the billing counter during the event to redeem your {eventDetails?.couponValue ? eventDetails.couponValue.replace(/\s*off/i, '').trim() : '₹500'} discount.
      </p>
    </div>
  );
};
 
export default CouponCard;
