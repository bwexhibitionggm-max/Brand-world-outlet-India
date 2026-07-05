import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiZoomInLine, RiCloseLine } from 'react-icons/ri';
import SafeImage from './SafeImage';

const MotionSafeImage = motion(SafeImage);

const Gallery = ({ gallery = [] }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedImage]);

  // Derive unique categories from gallery items
  const categories = ['All', ...new Set(gallery.map((item) => item.category))];

  // Filter images based on selected category
  const filteredGallery = activeCategory === 'All' 
    ? gallery 
    : gallery.filter((item) => item.category === activeCategory);

  return (
    <section className="gallery section-padding" id="gallery">
      <div className="gallery__container container">
        {/* Section Title */}
        <div className="section-title-wrapper">
          <span className="section-subtitle">Visual Experience</span>
          <h2 className="section-title">Shopper Gallery</h2>
          <div className="section-title-bar"></div>
        </div>

        {/* Filter Buttons */}
        <div className="gallery__filters">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`filter-btn ${activeCategory === cat ? 'filter-btn--active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Images */}
        <motion.div layout className="gallery__grid">
          <AnimatePresence mode="popLayout">
            {filteredGallery.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="gallery-item"
                onClick={() => setSelectedImage(item.url)}
              >
                <div className="gallery-item__img-wrapper">
                  <SafeImage src={item.url} alt={item.caption} className="gallery-item__img" />
                  <div className="gallery-item__overlay">
                    <span className="gallery-item__category">{item.category}</span>
                    <h4 className="gallery-item__title">{item.caption}</h4>
                    <div className="gallery-item__zoom-icon">
                      <RiZoomInLine size={24} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Lightbox / Popup Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="gallery__lightbox"
              onClick={() => setSelectedImage(null)}
            >
              <button className="lightbox-close" onClick={() => setSelectedImage(null)}>
                <RiCloseLine size={36} />
              </button>
              <MotionSafeImage
                initial={{ scale: 0.8, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 30 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                src={selectedImage}
                alt="Exhibition Preview Enlarged"
                className="lightbox-img"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Gallery;
