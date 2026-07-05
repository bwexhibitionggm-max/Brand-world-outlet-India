import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiPlayFill, RiCloseLine } from 'react-icons/ri';
// Helper to extract YouTube video ID and return standard maxresdefault thumbnail URL
const getYoutubeThumbnail = (url) => {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11)
    ? `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`
    : '';
};

const Testimonials = ({ testimonials = [] }) => {
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    if (activeVideo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeVideo]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  return (
    <section className="testimonials section-padding" id="reviews">
      <div className="testimonials__container container">
        {/* Section Title */}
        <div className="section-title-wrapper">
          <span className="section-subtitle">Social Buzz</span>
          <h2 className="section-title">Shopper Reels & Reviews</h2>
          <div className="section-title-bar"></div>
        </div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="testimonials__grid"
        >
          {testimonials.map((item) => {
            const videoThumbnail = getYoutubeThumbnail(item.videoUrl) || item.avatar;
            return (
              <motion.div
                key={item.id}
                variants={cardVariants}
                className="reel-card"
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                onClick={() => {
                  if (item.videoUrl) {
                    setActiveVideo(item.videoUrl);
                  }
                }}
                style={{ cursor: item.videoUrl ? 'pointer' : 'default' }}
              >
                {/* Video Cover */}
                <div className="reel-card__video-cover">
                  <img src={videoThumbnail} alt={item.name} className="reel-card__bg-img" />
                  <div className="reel-card__video-overlay"></div>

                  {/* Play Button Overlay */}
                  <div className="reel-card__play-btn">
                    <RiPlayFill size={28} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Video Modal Overlay */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="video-modal-backdrop"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className={`video-modal-content ${
                activeVideo.includes('instagram.com') ? 'video-modal-content--vertical' : ''
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="video-modal-close"
                onClick={() => setActiveVideo(null)}
                aria-label="Close video"
              >
                <RiCloseLine size={24} />
              </button>
              
              <div className="iframe-wrapper">
                <iframe
                  src={activeVideo}
                  title="Shopper Reel Review"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Testimonials;
