import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Highlights from './components/Highlights';
import Gallery from './components/Gallery';
import Testimonials from './components/Testimonials';
import Registration from './components/Registration';
import Footer from './components/Footer';
import AdminModal from './components/AdminModal';
import initialExhibitionData from './data/exhibitionData.json';
import { GITHUB_CONFIG } from './config/adminConfig';
import { Analytics } from '@vercel/analytics/react';
import './styles/main.scss';

function App() {
  const [eventData, setEventData] = useState(initialExhibitionData);
  const [showAdminModal, setShowAdminModal] = useState(false);

  useEffect(() => {
    const fetchLatestData = async () => {
      const token = localStorage.getItem('bw_coupon_admin_github_token');
      if (!token) return;

      try {
        const { owner, repo, path, branch } = GITHUB_CONFIG;
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json'
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.content) {
            const decoded = decodeURIComponent(
              atob(data.content.replace(/\s/g, ''))
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const parsed = JSON.parse(decoded);
            setEventData(parsed);
          }
        }
      } catch (error) {
        console.error('Failed to fetch latest configuration from GitHub:', error);
      }
    };

    fetchLatestData();
  }, []);

  return (
    <div className="app">
      {/* Sticky Glassmorphic Navbar */}
      <Navbar onTriggerAdmin={() => setShowAdminModal(true)} />

      <main>
        {/* Editorial Fashion Hero Area */}
        <Hero eventDetails={eventData.eventDetails} />

        {/* Exhibition features, discount briefs, and brands marquee */}
        <Highlights highlights={eventData.highlights} brands={eventData.brands} />

        {/* Masonry shopper photo showcase with lightboxes */}
        <Gallery gallery={eventData.gallery} />

        {/* Instagram reel mockups and reviews */}
        <Testimonials testimonials={eventData.testimonials} />

        {/* Input validations, Google Form fetch post, and CouponCard downloads */}
        <Registration eventDetails={eventData.eventDetails} googleFormConfig={eventData.googleFormConfig} />
      </main>

      {/* T&Cs, venues, addresses, and contacts */}
      <Footer eventDetails={eventData.eventDetails} termsAndConditions={eventData.termsAndConditions} />

      {/* Database-less Admin Modal */}
      {showAdminModal && (
        <AdminModal
          eventData={eventData}
          onUpdateData={setEventData}
          onClose={() => setShowAdminModal(false)}
        />
      )}
      <Analytics />
    </div>
  );
}

export default App;
