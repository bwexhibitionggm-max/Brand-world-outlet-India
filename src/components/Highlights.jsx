
import { motion } from 'framer-motion';
import { RiShieldStarLine, RiPercentLine, RiCoupon3Line, RiFocus2Line } from 'react-icons/ri';
const Highlights = ({ highlights, brands }) => {

  const iconsMap = {
    1: <RiShieldStarLine className="highlight-card__icon" />,
    2: <RiPercentLine className="highlight-card__icon" />,
    3: <RiCoupon3Line className="highlight-card__icon" />,
    4: <RiFocus2Line className="highlight-card__icon" />
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  return (
    <section className="highlights section-padding" id="highlights">
      <div className="highlights__container container">
        {/* Section Heading */}
        <div className="section-title-wrapper">
          <span className="section-subtitle">Why Attend</span>
          <h2 className="section-title">Exhibition Highlights</h2>
          <div className="section-title-bar"></div>
        </div>

        {/* Highlights Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="highlights__grid"
        >
          {highlights.map((item) => (
            <motion.div
              key={item.id}
              variants={cardVariants}
              className="highlight-card"
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="highlight-card__badge">{item.badge}</div>
              <div className="highlight-card__icon-wrapper">
                {iconsMap[item.id] || <RiShieldStarLine className="highlight-card__icon" />}
              </div>
              <h3 className="highlight-card__title">{item.title}</h3>
              <p className="highlight-card__desc">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Brands Slider / Showcase */}
        <div className="highlights__brands-showcase">
          <h4 className="brands-title">Participating Premium Brands</h4>
          <div className="brands-marquee">
            <div className="brands-marquee__content">
              {/* Double brands array for seamless scrolling effect */}
              {[...brands, ...brands].map((brand, index) => (
                <span key={index} className="brand-name">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Highlights;
