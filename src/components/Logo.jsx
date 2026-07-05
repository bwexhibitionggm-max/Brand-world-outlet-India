

const Logo = ({ size = 80, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`logo-svg ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <defs>
        {/* Silver Gradient for Rings & Text */}
        <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="25%" stopColor="#cfd8dc" />
          <stop offset="50%" stopColor="#90a4ae" />
          <stop offset="75%" stopColor="#cfd8dc" />
          <stop offset="100%" stopColor="#78909c" />
        </linearGradient>
        
        {/* Dark Radial Gradient for Logo Background */}
        <radialGradient id="darkBg" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
          <stop offset="0%" stopColor="#2c2c2c" />
          <stop offset="70%" stopColor="#121212" />
          <stop offset="100%" stopColor="#080808" />
        </radialGradient>

        {/* Drop Shadow for metallic text elements */}
        <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.5" />
        </filter>
      </defs>

      {/* Main Circular Background */}
      <circle cx="100" cy="100" r="95" fill="url(#darkBg)" stroke="url(#silverGradient)" strokeWidth="3" />
      
      {/* Inner thin silver ring */}
      <circle cx="100" cy="100" r="90" fill="none" stroke="url(#silverGradient)" strokeWidth="1" strokeOpacity="0.6" />

      {/* "BW" Heading */}
      <text
        x="100"
        y="95"
        fill="url(#silverGradient)"
        fontFamily="'Cinzel', 'Playfair Display', 'Georgia', serif"
        fontSize="54"
        fontWeight="800"
        textAnchor="middle"
        letterSpacing="-1"
      >
        BW
      </text>

      {/* "EXHIBITION" text */}
      <text
        x="100"
        y="126"
        fill="url(#silverGradient)"
        fontFamily="'Cinzel', 'Montserrat', 'Helvetica', sans-serif"
        fontSize="16"
        fontWeight="700"
        letterSpacing="2.5"
        textAnchor="middle"
      >
        EXHIBITION
      </text>

      {/* "— INDIA —" text */}
      <text
        x="100"
        y="152"
        fill="url(#silverGradient)"
        fontFamily="'Cinzel', 'Montserrat', 'Helvetica', sans-serif"
        fontSize="12"
        fontWeight="600"
        letterSpacing="1.5"
        textAnchor="middle"
        opacity="0.9"
      >
        — INDIA —
      </text>
    </svg>
  );
};

export default Logo;
