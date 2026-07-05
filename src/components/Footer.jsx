
import { RiInstagramLine, RiFacebookCircleLine, RiTwitterLine, RiWhatsappLine, RiMailSendLine, RiPhoneLine } from 'react-icons/ri';
import Logo from './Logo';
import { formatTerm } from '../utils/dateParser';

const Footer = ({ eventDetails, termsAndConditions = [] }) => {

  const currentYear = new Date().getFullYear();

  const getCityName = (venue) => {
    if (!venue) return 'Bhopal';
    const parts = venue.trim().split(/\s+/);
    return parts[parts.length - 1];
  };

  const cityName = eventDetails ? getCityName(eventDetails.venue) : 'Bhopal';

  return (
    <footer className="footer">
      <div className="footer__container container">
        {/* Top Section */}
        <div className="footer__top">
          {/* Logo & Brand description */}
          <div className="footer__info">
            <Logo size={60} className="footer__logo" />
            <p className="footer__desc">
              Experience the pinnacle of summer luxury fashion in {cityName}. Elevate your wardrobe with the world's most premium brands at exclusive prices.
            </p>
            {/* Social Icons */}
            <div className="footer__socials" style={{ display: 'none' }}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                <RiInstagramLine size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                <RiFacebookCircleLine size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">
                <RiTwitterLine size={20} />
              </a>
              <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="WhatsApp">
                <RiWhatsappLine size={20} />
              </a>
            </div>
          </div>

          {/* Event Contacts */}
          <div className="footer__contact">
            <h4>Exhibition Details</h4>
            <ul className="footer__contact-list">
              <li>
                <strong>Venue:</strong> {eventDetails.venue}
              </li>
              <li>
                <strong>Address:</strong> {eventDetails.address}
              </li>
              <li>
                <strong>Timings:</strong> {eventDetails.timings}
              </li>
              <li style={{ display: 'none' }}>
                <RiPhoneLine className="contact-icon" />
                <a href="tel:+919876543210">+91 98765 43210</a>
              </li>
              <li style={{ display: 'none' }}>
                <RiMailSendLine className="contact-icon" />
                <a href="mailto:info@bwexhibition.in">info@bwexhibition.in</a>
              </li>
            </ul>
          </div>

          {/* Terms & Conditions */}
          <div className="footer__terms">
            <h4>Terms & Conditions</h4>
            <ul className="footer__terms-list">
              {termsAndConditions.map((term, index) => (
                <li key={index}>{formatTerm(term, eventDetails)}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="footer__bottom">
          <p>&copy; {currentYear} BW Exhibition India. All Rights Reserved.</p>
          <div className="footer__bottom-links">
            <a href="#register">Claim Coupon</a>
            <a href="#highlights">Highlights</a>
            <a href="#gallery">Gallery</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
