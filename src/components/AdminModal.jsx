import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RiCloseLine, 
  RiSaveLine, 
  RiAddLine, 
  RiDeleteBinLine, 
  RiLockPasswordLine, 
  RiUserLine, 
  RiKeyLine, 
  RiInformationLine, 
  RiImageLine, 
  RiQuestionAnswerLine, 
  RiFolderSettingsLine, 
  RiStarFill,
  RiYoutubeLine,
  RiListSettingsLine,
  RiGoogleLine
} from 'react-icons/ri';
import { ADMIN_CREDENTIALS, GITHUB_CONFIG } from '../config/adminConfig';
import SafeImage from './SafeImage';
import { parseEventEndDate, formatDateToDatetimeLocal, parseEventDateRange, formatEventDateRange } from '../utils/dateParser';


// Helper function to encode UTF-8 string to Base64 in browser
const encodeUtf8ToBase64 = (str) => {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode('0x' + p1);
    })
  );
};const generateUniqueFileName = (fileName) => {
  return `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
};

const AdminModal = ({ eventData, onUpdateData, onClose }) => {
  // Authentication states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [githubToken, setGithubToken] = useState(() => {
    return localStorage.getItem('bw_coupon_admin_github_token') || '';
  });
  const [rememberToken, setRememberToken] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  // Form states (initialized from eventData)
  const [eventDetails, setEventDetails] = useState({ ...eventData.eventDetails });

  // Helper to format Date to YYYY-MM-DD for native date input value
  const formatDateToDateInput = (date) => {
    if (!date || isNaN(date.getTime())) return '';
    const pad = (num) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const [startDateVal, setStartDateVal] = useState(() => {
    const parsed = parseEventDateRange(eventData.eventDetails.dates || '');
    return formatDateToDateInput(parsed.startDate);
  });

  const [endDateVal, setEndDateVal] = useState(() => {
    const parsed = parseEventDateRange(eventData.eventDetails.dates || '');
    return formatDateToDateInput(parsed.endDate);
  });

  const handleStartDateChange = (newStartDateStr) => {
    setStartDateVal(newStartDateStr);
    if (newStartDateStr && endDateVal) {
      const startParts = newStartDateStr.split('-');
      const startObj = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]));
      
      const endParts = endDateVal.split('-');
      const endObj = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]));
      
      const formattedDates = formatEventDateRange(startObj, endObj);
      setEventDetails(prev => ({
        ...prev,
        dates: formattedDates
      }));
    }
  };

  const handleEndDateChange = (newEndDateStr) => {
    setEndDateVal(newEndDateStr);
    if (startDateVal && newEndDateStr) {
      const startParts = startDateVal.split('-');
      const startObj = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]));
      
      const endParts = newEndDateStr.split('-');
      const endObj = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]));
      
      const formattedDates = formatEventDateRange(startObj, endObj);
      setEventDetails(prev => ({
        ...prev,
        dates: formattedDates
      }));
    }
  };
  const [googleFormConfig, setGoogleFormConfig] = useState({
    sheetLink: '',
    formLink: '',
    actionUrl: '',
    entryName: '',
    entryEmail: '',
    entryPhone: '',
    subsheetName: '',
    entrySubsheet: '',
    ...eventData.googleFormConfig
  });
  const [brandsText, setBrandsText] = useState((eventData.brands || []).join(', '));
  const [highlights, setHighlights] = useState(
    (eventData.highlights || []).map(h => ({ ...h }))
  );
  const [gallery, setGallery] = useState(
    (eventData.gallery || []).map(g => ({ ...g }))
  );
  const [availableCategories, setAvailableCategories] = useState(() => {
    const unique = [...new Set((eventData.gallery || []).map(g => g.category))].filter(Boolean);
    return unique.length > 0 ? unique : ['Exhibition Preview', 'Haute Couture', 'Designer Wear'];
  });
  const [selectedManageCategory, setSelectedManageCategory] = useState(() => {
    const unique = [...new Set((eventData.gallery || []).map(g => g.category))].filter(Boolean);
    return unique[0] || 'Exhibition Preview';
  });
  const [globalRenameInput, setGlobalRenameInput] = useState('');
  const [globalAddInput, setGlobalAddInput] = useState('');
  const [uploadingImageId, setUploadingImageId] = useState(null);
  const [resolvedImages, setResolvedImages] = useState({});
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [newImageCategory, setNewImageCategory] = useState(availableCategories[0] || 'Uncategorized');
  const [newImageLocalPreview, setNewImageLocalPreview] = useState('');
  const [isUploadingNewImage, setIsUploadingNewImage] = useState(false);
  const [testimonials, setTestimonials] = useState(
    (eventData.testimonials || []).map(t => ({ ...t }))
  );
  const [faqs, setFaqs] = useState(
    (eventData.faqs || []).map(f => ({ ...f }))
  );
  const [termsAndConditions, setTermsAndConditions] = useState(
    [...(eventData.termsAndConditions || [])]
  );  // Modal states for adding items
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const [showAddFaqModal, setShowAddFaqModal] = useState(false);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  const [showAddTermModal, setShowAddTermModal] = useState(false);
  const [newTermText, setNewTermText] = useState('');

  // GitHub integration settings
  const [githubConfig, setGithubConfig] = useState({ ...GITHUB_CONFIG });

  // Status & loading states
  const [status, setStatus] = useState('idle'); // 'idle' | 'saving' | 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      if (rememberToken && githubToken) {
        localStorage.setItem('bw_coupon_admin_github_token', githubToken);
      } else if (!rememberToken) {
        localStorage.removeItem('bw_coupon_admin_github_token');
      }
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid admin username or password');
    }
  };

  const handleSave = async () => {
    // Validation
    const validationErrors = [];

    // General Info validation
    if (!eventDetails.title?.trim()) validationErrors.push({ tab: 'general', msg: 'Main Title is required.' });
    if (!eventDetails.subheading?.trim()) validationErrors.push({ tab: 'general', msg: 'Subheading is required.' });
    if (!startDateVal?.trim()) validationErrors.push({ tab: 'general', msg: 'Event Start Date is required.' });
    if (!endDateVal?.trim()) validationErrors.push({ tab: 'general', msg: 'Event End Date is required.' });
    if (!eventDetails.timings?.trim()) validationErrors.push({ tab: 'general', msg: 'Timings is required.' });
    if (!eventDetails.venue?.trim()) validationErrors.push({ tab: 'general', msg: 'Venue Name is required.' });
    if (!eventDetails.locationLink?.trim()) validationErrors.push({ tab: 'general', msg: 'Location Link is required.' });
    if (!eventDetails.address?.trim()) validationErrors.push({ tab: 'general', msg: 'Address is required.' });
    if (!eventDetails.couponValue?.trim()) validationErrors.push({ tab: 'general', msg: 'Coupon Value Text is required.' });
    if (!eventDetails.couponValidity?.trim()) validationErrors.push({ tab: 'general', msg: 'Coupon Validity is required.' });
    if (!eventDetails.bannerText?.trim()) validationErrors.push({ tab: 'general', msg: 'Hero Banner Text is required.' });
    if (!brandsText?.trim()) validationErrors.push({ tab: 'general', msg: 'Participating Brands (Comma-separated list) is required.' });

    // Git Settings validation
    if (!githubConfig.owner?.trim()) validationErrors.push({ tab: 'github', msg: 'Repository Owner is required.' });
    if (!githubConfig.repo?.trim()) validationErrors.push({ tab: 'github', msg: 'Repository Name is required.' });
    if (!githubConfig.branch?.trim()) validationErrors.push({ tab: 'github', msg: 'Target Branch is required.' });
    if (!githubConfig.path?.trim()) validationErrors.push({ tab: 'github', msg: 'JSON Data File Path is required.' });

    // Google Form/Web App validation
    if (!googleFormConfig.sheetLink?.trim()) validationErrors.push({ tab: 'googleFormConfig', msg: 'Google Sheet Link is required.' });
    if (!googleFormConfig.actionUrl?.trim()) validationErrors.push({ tab: 'googleFormConfig', msg: 'Google Form Response Action URL (or Web App URL) is required.' });
    if (!googleFormConfig.subsheetName?.trim()) validationErrors.push({ tab: 'googleFormConfig', msg: 'Subsheet Name is required.' });

    const isWebApp = googleFormConfig.actionUrl?.includes('script.google.com');
    if (!isWebApp) {
      if (!googleFormConfig.formLink?.trim()) validationErrors.push({ tab: 'googleFormConfig', msg: 'Google Form Link is required.' });
      if (!googleFormConfig.entryName?.trim()) validationErrors.push({ tab: 'googleFormConfig', msg: 'Name Field Entry ID is required.' });
      if (!googleFormConfig.entryEmail?.trim()) validationErrors.push({ tab: 'googleFormConfig', msg: 'Email Field Entry ID is required.' });
      if (!googleFormConfig.entryPhone?.trim()) validationErrors.push({ tab: 'googleFormConfig', msg: 'Phone Field Entry ID is required.' });
      if (!googleFormConfig.entrySubsheet?.trim()) validationErrors.push({ tab: 'googleFormConfig', msg: 'Subsheet Field Entry ID is required.' });
    }

    // Highlights validation
    highlights.forEach((item, index) => {
      if (!item.badge?.trim()) validationErrors.push({ tab: 'highlights', msg: `Highlight #${index + 1}: Badge Text is required.` });
      if (!item.title?.trim()) validationErrors.push({ tab: 'highlights', msg: `Highlight #${index + 1}: Title is required.` });
      if (!item.description?.trim()) validationErrors.push({ tab: 'highlights', msg: `Highlight #${index + 1}: Description is required.` });
    });

    // Gallery validation
    gallery.forEach((item, index) => {
      if (!item.url?.trim()) validationErrors.push({ tab: 'gallery', msg: `Gallery Image #${index + 1}: URL is required.` });
      if (!item.caption?.trim()) validationErrors.push({ tab: 'gallery', msg: `Gallery Image #${index + 1}: Caption is required.` });
      if (!item.category?.trim()) validationErrors.push({ tab: 'gallery', msg: `Gallery Image #${index + 1}: Category is required.` });
    });

    // Testimonials/Reels validation
    testimonials.forEach((item, index) => {
      if (!item.videoUrl?.trim()) validationErrors.push({ tab: 'testimonials', msg: `Video Reel #${index + 1}: URL is required.` });
    });

    // FAQs validation
    faqs.forEach((item, index) => {
      if (!item.question?.trim()) validationErrors.push({ tab: 'faqs', msg: `FAQ #${index + 1}: Question is required.` });
      if (!item.answer?.trim()) validationErrors.push({ tab: 'faqs', msg: `FAQ #${index + 1}: Answer is required.` });
    });

    // Terms & Conditions validation
    termsAndConditions.forEach((term, index) => {
      if (!term?.trim()) validationErrors.push({ tab: 'faqs', msg: `Term & Condition #${index + 1} is required.` });
    });

    if (validationErrors.length > 0) {
      setStatus('error');
      setStatusMessage(`Validation Failed: ${validationErrors[0].msg}`);
      setActiveTab(validationErrors[0].tab);
      
      // Scroll modal content to top so the validation error banner is visible
      const contentEl = document.querySelector('.admin-dashboard__content');
      if (contentEl) {
        contentEl.scrollTop = 0;
      }
      return;
    }

    if (!githubToken) {
      setStatus('error');
      setStatusMessage('GitHub Access Token is required to save changes to the repository.');
      return;
    }

    setStatus('saving');
    setStatusMessage('Fetching current data SHA from GitHub...');

    try {
      const { owner, repo, path, branch } = githubConfig;

      // 1. Get current file data to retrieve the required SHA
      const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${githubToken}`
      };

      const getRes = await fetch(getUrl, { headers });
      if (!getRes.ok) {
        throw new Error(
          `Could not get file SHA from GitHub. Status: ${getRes.status}. Check your repo settings and token.`
        );
      }
      const fileData = await getRes.json();
      const currentSha = fileData.sha;

      // 2. Format local state back into the JSON structure
      const parsedBrands = brandsText
        .split(',')
        .map(b => b.trim())
        .filter(b => b.length > 0);

      const updatedData = {
        eventDetails,
        brands: parsedBrands,
        highlights,
        gallery,
        testimonials,
        faqs,
        termsAndConditions,
        googleFormConfig
      };

      const jsonContent = JSON.stringify(updatedData, null, 2);
      const encodedContent = encodeUtf8ToBase64(jsonContent);

      setStatusMessage('Pushing new changes to GitHub repository...');

      // 3. Make PUT request to save changes
      const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
      const putBody = {
        message: 'admin: dynamic update of exhibition configurations',
        content: encodedContent,
        sha: currentSha,
        branch
      };

      const putRes = await fetch(putUrl, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(putBody)
      });

      if (!putRes.ok) {
        const errData = await putRes.json();
        if (putRes.status === 409 || (errData.message && errData.message.includes('does not match'))) {
          throw new Error(
            'Sync Conflict: The remote exhibition data has changed since you loaded this page. Please refresh the page to pull the latest updates, then try saving again.'
          );
        }
        throw new Error(errData.message || `GitHub save failed with status ${putRes.status}`);
      }

      // Success
      setStatus('success');
      setStatusMessage('Changes saved to GitHub successfully! Rebuilding live site (takes ~1 min).');
      
      // Update local React state instantly for live preview
      onUpdateData(updatedData);

      // Auto-reset state after 4 seconds
      setTimeout(() => {
        setStatus('idle');
        setStatusMessage('');
      }, 4000);

    } catch (err) {
      console.error(err);
      setStatus('error');
      setStatusMessage(err.message || 'An error occurred while saving.');
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Helper to fetch private GitHub images via API using token
  useEffect(() => {
    const resolveImages = async () => {
      const token = githubToken || localStorage.getItem('bw_coupon_admin_github_token');
      if (!token || !isLoggedIn) return;

      const newResolved = { ...resolvedImages };
      let changed = false;

      for (const item of gallery) {
        if (item.url && item.url.startsWith('https://raw.githubusercontent.com/') && !newResolved[item.url]) {
          try {
            let owner = githubConfig.owner;
            let repo = githubConfig.repo;
            let branch = githubConfig.branch;
            let path = '';

            const prefix = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`;
            if (item.url.startsWith(prefix)) {
              path = item.url.replace(prefix, '');
            } else {
              const parts = item.url.replace('https://raw.githubusercontent.com/', '').split('/');
              if (parts.length >= 4) {
                owner = parts[0];
                repo = parts[1];
                branch = parts[2];
                path = parts.slice(3).join('/');
              }
            }

            if (path) {
              const apiUr = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
              const res = await fetch(apiUr, {
                headers: { 
                  Authorization: `Bearer ${token}`,
                  Accept: 'application/vnd.github+json'
                }
              });
              if (res.ok) {
                const data = await res.json();
                if (data.content) {
                  newResolved[item.url] = `data:image/png;base64,${data.content.replace(/\s/g, '')}`;
                  changed = true;
                }
              }
            }
          } catch (e) {
            console.error('Failed to resolve private image', e);
          }
        }
      }

      if (changed) {
        setResolvedImages(newResolved);
      }
    };

    resolveImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gallery, githubToken, isLoggedIn]);

  // Helper handlers to manipulate lists
  const handleRenameCategory = (oldName, newName) => {
    const trimmed = newName.trim();
    if (!trimmed || oldName === trimmed) return;
    
    // Update available categories
    setAvailableCategories(prev => {
      const updated = prev.map(cat => cat === oldName ? trimmed : cat);
      return [...new Set(updated)];
    });

    // Update category of all gallery items that use it
    setGallery(prev => prev.map(item => item.category === oldName ? { ...item, category: trimmed } : item));
  };

  const handleDeleteCategory = (catName) => {
    // Determine fallback category
    const remaining = availableCategories.filter(cat => cat !== catName);
    let fallback = remaining[0];
    
    // Add fallback if remaining list is empty
    if (remaining.length === 0) {
      fallback = 'Uncategorized';
      remaining.push(fallback);
    }

    setAvailableCategories(remaining);

    // Update gallery items to fallback
    setGallery(prev => prev.map(item => item.category === catName ? { ...item, category: fallback } : item));
  };

  const handleCreateCategory = (newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    setAvailableCategories(prev => {
      if (prev.includes(trimmed)) return prev;
      return [...prev, trimmed];
    });
  };

  const handleOpenAddImageModal = () => {
    setNewImageCategory(availableCategories[0] || 'Uncategorized');
    setNewImageFile(null);
    setNewImageUrl('');
    setNewImageCaption('');
    setNewImageLocalPreview('');
    setShowAddImageModal(true);
  };

  const handleAddNewGalleryItem = async () => {
    let finalUrl = newImageUrl.trim();

    if (newImageFile) {
      const token = githubToken || localStorage.getItem('bw_coupon_admin_github_token');
      if (!token) {
        alert('GitHub Token is required to upload images. Please configure it in Git Settings.');
        return;
      }

      const owner = githubConfig.owner;
      const repo = githubConfig.repo;
      const branch = githubConfig.branch;

      if (!owner || !repo || !branch) {
        alert('GitHub repository configuration is missing.');
        return;
      }

      setIsUploadingNewImage(true);

      try {
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
          };
          reader.onerror = reject;
        });
        reader.readAsDataURL(newImageFile);
        const base64Content = await base64Promise;

        const cleanFileName = generateUniqueFileName(newImageFile.name);
        const uploadPath = `public/gallery/${cleanFileName}`;

        const uploadUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${uploadPath}`;
        
        const res = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Upload gallery image: ${cleanFileName}`,
            content: base64Content,
            branch: branch
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || `Upload failed with status ${res.status}`);
        }

        finalUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${uploadPath}`;

        if (newImageLocalPreview) {
          setResolvedImages(prev => ({
            ...prev,
            [finalUrl]: newImageLocalPreview
          }));
        }

      } catch (err) {
        console.error(err);
        alert(`Failed to upload image: ${err.message}`);
        setIsUploadingNewImage(false);
        return;
      }
    }

    if (!newImageCaption.trim()) {
      alert('Image Caption is required.');
      setIsUploadingNewImage(false);
      return;
    }

    if (!newImageCategory.trim()) {
      alert('Image Category is required.');
      setIsUploadingNewImage(false);
      return;
    }

    if (!finalUrl) {
      alert('Please select a local image file or enter an image URL.');
      setIsUploadingNewImage(false);
      return;
    }

    setGallery(prev => [
      ...prev,
      {
        id: Date.now(),
        url: finalUrl,
        caption: newImageCaption.trim(),
        category: newImageCategory.trim()
      }
    ]);

    setNewImageFile(null);
    setNewImageUrl('');
    setNewImageCaption('');
    setNewImageCategory(availableCategories[0] || 'Uncategorized');
    setNewImageLocalPreview('');
    setIsUploadingNewImage(false);
    setShowAddImageModal(false);
  };

  const handleImageUpload = async (e, itemIndex, itemId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = githubToken || localStorage.getItem('bw_coupon_admin_github_token');
    if (!token) {
      alert('GitHub Token is required to upload images. Please configure it in Git Settings.');
      return;
    }

    const owner = githubConfig.owner;
    const repo = githubConfig.repo;
    const branch = githubConfig.branch;

    if (!owner || !repo || !branch) {
      alert('GitHub repository configuration is missing.');
      return;
    }

    setUploadingImageId(itemId);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => {
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Content = await base64Promise;

      const cleanFileName = generateUniqueFileName(file.name);
      const uploadPath = `public/gallery/${cleanFileName}`;

      const uploadUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${uploadPath}`;
      
      const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Upload gallery image: ${cleanFileName}`,
          content: base64Content,
          branch: branch
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || `Upload failed with status ${res.status}`);
      }

      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${uploadPath}`;

      // Create local preview URL to display instantly without downloading
      const localUrl = URL.createObjectURL(file);
      setResolvedImages(prev => ({
        ...prev,
        [rawUrl]: localUrl
      }));

      setGallery(prev => {
        const updated = [...prev];
        if (updated[itemIndex]) {
          updated[itemIndex] = { ...updated[itemIndex], url: rawUrl };
        }
        return updated;
      });

    } catch (err) {
      console.error(err);
      alert(`Failed to upload image: ${err.message}`);
    } finally {
      setUploadingImageId(null);
    }
  };

  const handleRemoveGalleryItem = (id) => {
    setGallery(gallery.filter(item => item.id !== id));
  };

  const handleAddTestimonial = () => {
    setNewVideoUrl('');
    setShowAddVideoModal(true);
  };

  const handleConfirmAddTestimonial = () => {
    const trimmed = newVideoUrl.trim();
    if (!trimmed) {
      alert('Video Reel URL is required.');
      return;
    }
    setTestimonials([
      ...testimonials,
      {
        id: Date.now(),
        name: 'Guest Reviewer',
        role: 'Visitor',
        rating: 5,
        text: 'Wonderful experience shopping premium brands!',
        views: '1.2K Views',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        videoUrl: trimmed
      }
    ]);
    setShowAddVideoModal(false);
  };

  const handleRemoveTestimonial = (id) => {
    setTestimonials(testimonials.filter(item => item.id !== id));
  };

  const handleAddFaq = () => {
    setNewFaqQuestion('');
    setNewFaqAnswer('');
    setShowAddFaqModal(true);
  };

  const handleConfirmAddFaq = () => {
    const q = newFaqQuestion.trim();
    const a = newFaqAnswer.trim();
    if (!q) {
      alert('Question is required.');
      return;
    }
    if (!a) {
      alert('Answer is required.');
      return;
    }
    setFaqs([
      ...faqs,
      {
        question: q,
        answer: a
      }
    ]);
    setShowAddFaqModal(false);
  };

  const handleRemoveFaq = (index) => {
    setFaqs(faqs.filter((_, idx) => idx !== index));
  };

  const handleAddTerm = () => {
    setNewTermText('');
    setShowAddTermModal(true);
  };

  const handleConfirmAddTerm = () => {
    const text = newTermText.trim();
    if (!text) {
      alert('Term details text is required.');
      return;
    }
    setTermsAndConditions([...termsAndConditions, text]);
    setShowAddTermModal(false);
  };

  const handleRemoveTerm = (index) => {
    setTermsAndConditions(termsAndConditions.filter((_, idx) => idx !== index));
  };

  return (
    <div className="admin-modal-backdrop">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="admin-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="admin-modal__header">
          <div className="title-section">
            <RiFolderSettingsLine size={24} className="gold-icon" />
            <h2>BW Exhibition Console</h2>
            {isLoggedIn && <span className="admin-badge">Admin Mode</span>}
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close Admin Modal">
            <RiCloseLine size={24} />
          </button>
        </div>

        {/* Status Alert Banner */}
        {status !== 'idle' && (
          <div className={`admin-modal__alert admin-modal__alert--${status}`}>
            <span className="spinner-wrapper">
              {status === 'saving' && <span className="spinner"></span>}
            </span>
            <p>{statusMessage}</p>
          </div>
        )}

        {!isLoggedIn ? (
          /* Login Panel */
          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="login-desc">
              <RiLockPasswordLine size={48} className="lock-icon" />
              <h3>Authentication Required</h3>
              <p>Please log in using your local credentials to manage exhibition parameters.</p>
            </div>

            <div className="form-group">
              <label htmlFor="admin-username">Admin Username</label>
              <div className="input-wrapper">
                <RiUserLine className="input-icon" />
                <input
                  type="text"
                  id="admin-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="admin-password">Admin Password</label>
              <div className="input-wrapper">
                <RiKeyLine className="input-icon" />
                <input
                  type="password"
                  id="admin-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="github-token">GitHub Token (Fine-grained or Classic PAT)</label>
              <div className="input-wrapper">
                <RiKeyLine className="input-icon text-gold" />
                <input
                  type="password"
                  id="github-token"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="github_pat_..."
                  required
                />
              </div>
              <span className="input-subtext">Needs repo write permissions to push dynamic content.</span>
            </div>

            <div className="form-checkbox">
              <input
                type="checkbox"
                id="remember-token"
                checked={rememberToken}
                onChange={(e) => setRememberToken(e.target.checked)}
              />
              <label htmlFor="remember-token">Save GitHub Token securely on this device</label>
            </div>

            {loginError && <p className="login-error-msg">{loginError}</p>}

            <button type="submit" className="btn btn--submit mt-4">
              Enter Console
            </button>
          </form>
        ) : (
          /* Dashboard Layout */
          <div className="admin-dashboard">
            {/* Sidebar navigation */}
            <div className="admin-dashboard__sidebar">
              <button 
                className={`sidebar-tab ${activeTab === 'general' ? 'sidebar-tab--active' : ''}`}
                onClick={() => setActiveTab('general')}
              >
                <RiInformationLine size={18} />
                <span>General Info</span>
              </button>
              <button 
                className={`sidebar-tab ${activeTab === 'highlights' ? 'sidebar-tab--active' : ''}`}
                onClick={() => setActiveTab('highlights')}
              >
                <RiListSettingsLine size={18} />
                <span>Highlights</span>
              </button>
              <button 
                className={`sidebar-tab ${activeTab === 'gallery' ? 'sidebar-tab--active' : ''}`}
                onClick={() => setActiveTab('gallery')}
              >
                <RiImageLine size={18} />
                <span>Gallery</span>
              </button>
              <button 
                className={`sidebar-tab ${activeTab === 'testimonials' ? 'sidebar-tab--active' : ''}`}
                onClick={() => setActiveTab('testimonials')}
              >
                <RiStarFill size={18} />
                <span>Reviews & Reels</span>
              </button>
              <button 
                className={`sidebar-tab ${activeTab === 'faqs' ? 'sidebar-tab--active' : ''}`}
                onClick={() => setActiveTab('faqs')}
              >
                <RiQuestionAnswerLine size={18} />
                <span>FAQs & Terms</span>
              </button>
              <button 
                className={`sidebar-tab ${activeTab === 'googleFormConfig' ? 'sidebar-tab--active' : ''}`}
                onClick={() => setActiveTab('googleFormConfig')}
              >
                <RiGoogleLine size={18} />
                <span>Form & Sheet</span>
              </button>
              <button 
                className={`sidebar-tab ${activeTab === 'github' ? 'sidebar-tab--active' : ''}`}
                onClick={() => setActiveTab('github')}
              >
                <RiFolderSettingsLine size={18} />
                <span>Git Settings</span>
              </button>
            </div>

            {/* Editing Pane */}
            <div className="admin-dashboard__content">
              <div className="pane-inner">
                {activeTab === 'general' && (
                  <div className="edit-pane">
                    <h3>General Event Details</h3>
                    <p className="pane-desc">Manage core parameters showing in the Hero and Footer sections.</p>

                    <div className="form-grid">
                      <div className="form-group col-span-2">
                        <label>Main Title (HTML tags like &lt;br /&gt; or &lt;span class="text-gold"&gt; supported) <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="text"
                          value={eventDetails.title || ''}
                          onChange={(e) => setEventDetails({ ...eventDetails, title: e.target.value })}
                        />
                      </div>

                      <div className="form-group col-span-2">
                        <label>Subheading <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="text"
                          value={eventDetails.subheading || ''}
                          onChange={(e) => setEventDetails({ ...eventDetails, subheading: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Event Start Date <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="date"
                          value={startDateVal}
                          onChange={(e) => handleStartDateChange(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Event End Date <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="date"
                          value={endDateVal}
                          onChange={(e) => handleEndDateChange(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Timings <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="text"
                          value={eventDetails.timings || ''}
                          onChange={(e) => setEventDetails({ ...eventDetails, timings: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Timer Target Date & Time (Optional Override)</label>
                        <input
                          type="datetime-local"
                          value={eventDetails.timerTarget ? eventDetails.timerTarget.substring(0, 16) : formatDateToDatetimeLocal(parseEventEndDate(eventDetails.dates, eventDetails.timings))}
                          onChange={(e) => setEventDetails({ ...eventDetails, timerTarget: e.target.value })}
                        />
                        <span className="input-subtext">Defaults automatically to the end of "Event Dates" and end of "Timings" if left blank.</span>
                      </div>

                      <div className="form-group">
                        <label>Venue Name <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="text"
                          value={eventDetails.venue || ''}
                          onChange={(e) => setEventDetails({ ...eventDetails, venue: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Location Link (Google Maps) <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="text"
                          value={eventDetails.locationLink || ''}
                          onChange={(e) => setEventDetails({ ...eventDetails, locationLink: e.target.value })}
                          placeholder="https://maps.google.com/?q=..."
                        />
                      </div>

                      <div className="form-group">
                        <label>Address <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="text"
                          value={eventDetails.address || ''}
                          onChange={(e) => setEventDetails({ ...eventDetails, address: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Coupon Value Text <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="text"
                          value={eventDetails.couponValue || ''}
                          onChange={(e) => setEventDetails({ ...eventDetails, couponValue: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Coupon Validity <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="text"
                          value={eventDetails.couponValidity || ''}
                          onChange={(e) => setEventDetails({ ...eventDetails, couponValidity: e.target.value })}
                        />
                      </div>

                      <div className="form-group col-span-2">
                        <label>Hero Banner Text <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="text"
                          value={eventDetails.bannerText || ''}
                          onChange={(e) => setEventDetails({ ...eventDetails, bannerText: e.target.value })}
                        />
                      </div>

                      <div className="form-group col-span-2">
                        <label>Participating Brands (Comma-separated list) <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <textarea
                          rows="3"
                          value={brandsText}
                          onChange={(e) => setBrandsText(e.target.value)}
                          placeholder="Zara, Gucci, Tommy Hilfiger..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'highlights' && (
                  <div className="edit-pane">
                    <h3>Exhibition Highlights</h3>
                    <p className="pane-desc">Edit key features (exactly 4 items) displayed on the Highlights grid.</p>

                    <div className="highlights-editor">
                      {highlights.map((item, index) => (
                        <div key={item.id} className="highlight-item-box">
                          <h4>Highlight #{index + 1}</h4>
                          <div className="form-grid">
                            <div className="form-group">
                              <label>Badge Text <span style={{ color: '#ff4d4f' }}>*</span></label>
                              <input
                                type="text"
                                value={item.badge || ''}
                                onChange={(e) => {
                                  const newHighlights = [...highlights];
                                  newHighlights[index].badge = e.target.value;
                                  setHighlights(newHighlights);
                                }}
                              />
                            </div>
                            <div className="form-group">
                              <label>Title <span style={{ color: '#ff4d4f' }}>*</span></label>
                              <input
                                type="text"
                                value={item.title || ''}
                                onChange={(e) => {
                                  const newHighlights = [...highlights];
                                  newHighlights[index].title = e.target.value;
                                  setHighlights(newHighlights);
                                }}
                              />
                            </div>
                            <div className="form-group col-span-2">
                              <label>Description <span style={{ color: '#ff4d4f' }}>*</span></label>
                              <input
                                type="text"
                                value={item.description || ''}
                                onChange={(e) => {
                                  const newHighlights = [...highlights];
                                  newHighlights[index].description = e.target.value;
                                  setHighlights(newHighlights);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'gallery' && (
                  <div className="edit-pane">
                    <div className="pane-header">
                      <h3>Shopper Photo Gallery</h3>
                      <button className="btn btn--add" onClick={handleOpenAddImageModal}>
                        <RiAddLine /> Add Image
                      </button>
                    </div>
                    <p className="pane-desc">Manage URLs and categories for image masonry grid.</p>

                    <div className="global-category-manager" style={{ marginBottom: '2rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '1.25rem' }}>
                      <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#d4af37', marginBottom: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' }}>Manage Gallery Categories</h4>
                      <div className="category-action-row">
                        <div className="category-edit-box">
                          <select
                            value={selectedManageCategory}
                            onChange={(e) => setSelectedManageCategory(e.target.value)}
                          >
                            {availableCategories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Rename selected..."
                            value={globalRenameInput}
                            onChange={(e) => setGlobalRenameInput(e.target.value)}
                            style={{ flex: 1, padding: '0.35rem 0.6rem', fontSize: '0.85rem', background: 'rgba(10, 10, 10, 0.65)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', color: '#fff', outline: 'none' }}
                          />
                          <button
                            type="button"
                            className="btn btn--rename"
                            onClick={() => {
                              if (globalRenameInput.trim() && selectedManageCategory) {
                                handleRenameCategory(selectedManageCategory, globalRenameInput);
                                setGlobalRenameInput('');
                                setSelectedManageCategory(globalRenameInput.trim());
                              }
                            }}
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            className="btn btn--delete-opt"
                            onClick={() => {
                              if (selectedManageCategory) {
                                handleDeleteCategory(selectedManageCategory);
                                const remaining = availableCategories.filter(c => c !== selectedManageCategory);
                                setSelectedManageCategory(remaining[0] || 'Uncategorized');
                              }
                            }}
                          >
                            Remove
                          </button>
                        </div>

                        <div className="category-add-box" style={{ marginTop: '0.5rem' }}>
                          <input
                            type="text"
                            placeholder="Add new category option..."
                            value={globalAddInput}
                            onChange={(e) => setGlobalAddInput(e.target.value)}
                            style={{ flex: 1, padding: '0.35rem 0.6rem', fontSize: '0.85rem', background: 'rgba(10, 10, 10, 0.65)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', color: '#fff', outline: 'none' }}
                          />
                          <button
                            type="button"
                            className="btn btn--add-opt"
                            onClick={() => {
                              if (globalAddInput.trim()) {
                                handleCreateCategory(globalAddInput);
                                setSelectedManageCategory(globalAddInput.trim());
                                setGlobalAddInput('');
                              }
                            }}
                          >
                            Add Category
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="list-editor">
                      {gallery.length === 0 ? (
                        <p className="empty-msg">No images in gallery. Click "Add Image" to insert one.</p>
                      ) : (
                        gallery.map((item, index) => (
                          <div key={item.id || index} className="list-item-box">
                            <div className="list-item-header">
                              <span>Image #{index + 1}</span>
                              <button 
                                className="delete-icon-btn" 
                                onClick={() => handleRemoveGalleryItem(item.id)}
                                title="Delete Image"
                              >
                                <RiDeleteBinLine size={18} />
                              </button>
                            </div>
                            
                            <div className="gallery-item-edit-grid">
                              <div className="gallery-item-preview">
                                {uploadingImageId === item.id ? (
                                  <div className="upload-spinner">Uploading...</div>
                                ) : item.url ? (
                                  <SafeImage 
                                    src={resolvedImages[item.url] || item.url} 
                                    alt={item.caption || 'Preview'} 
                                  />
                                ) : (
                                  <div className="no-image-preview">No Image</div>
                                )}
                                <label className="upload-overlay-btn">
                                  <span>Change Image</span>
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => handleImageUpload(e, index, item.id)}
                                  />
                                </label>
                              </div>

                              <div className="form-grid">
                                <div className="form-group col-span-2">
                                  <label>Image URL <span style={{ color: '#ff4d4f' }}>*</span></label>
                                  <input
                                    type="text"
                                    value={item.url || ''}
                                    onChange={(e) => {
                                      const newGallery = [...gallery];
                                      newGallery[index].url = e.target.value;
                                      setGallery(newGallery);
                                    }}
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Caption <span style={{ color: '#ff4d4f' }}>*</span></label>
                                  <input
                                    type="text"
                                    value={item.caption || ''}
                                    onChange={(e) => {
                                      const newGallery = [...gallery];
                                      newGallery[index].caption = e.target.value;
                                      setGallery(newGallery);
                                    }}
                                  />
                                </div>
                                <div className="form-group">
                                   <label>Category (Filter group) <span style={{ color: '#ff4d4f' }}>*</span></label>
                                   <select
                                     value={item.category || ''}
                                     onChange={(e) => {
                                       const newGallery = [...gallery];
                                       newGallery[index].category = e.target.value;
                                       setGallery(newGallery);
                                     }}
                                   >
                                     {availableCategories.map((cat) => (
                                       <option key={cat} value={cat}>
                                         {cat}
                                       </option>
                                     ))}
                                   </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'testimonials' && (
                  <div className="edit-pane">
                    <div className="pane-header">
                      <h3>Shopper Reels & Videos</h3>
                      <button className="btn btn--add" onClick={handleAddTestimonial}>
                        <RiAddLine /> Add Video Reel
                      </button>
                    </div>
                    <p className="pane-desc">Manage customer review videos and shopper reels.</p>

                    <div className="list-editor">
                      {testimonials.length === 0 ? (
                        <p className="empty-msg">No video reels in list. Click "Add Video Reel" to insert one.</p>
                      ) : (
                        testimonials.map((item, index) => (
                          <div key={item.id || index} className="list-item-box">
                            <div className="list-item-header">
                              <span>Video Reel #{index + 1}</span>
                              <button 
                                className="delete-icon-btn" 
                                onClick={() => handleRemoveTestimonial(item.id)}
                                title="Delete Review"
                              >
                                <RiDeleteBinLine size={18} />
                              </button>
                            </div>

                            <div className="list-item-body-single" style={{ padding: '1rem 0 0 0' }}>
                              <div className="form-group">
                                <label>YouTube Embed Video URL <span style={{ color: '#ff4d4f' }}>*</span></label>
                                <div className="input-wrapper input-wrapper--url">
                                  <RiYoutubeLine className="input-icon text-red" />
                                  <input
                                    type="text"
                                    value={item.videoUrl || ''}
                                    onChange={(e) => {
                                      const newTestimonials = [...testimonials];
                                      newTestimonials[index].videoUrl = e.target.value;
                                      setTestimonials(newTestimonials);
                                    }}
                                    placeholder="https://www.youtube.com/embed/XXXXXX"
                                  />
                                </div>
                                <span className="input-subtext">Must be standard YouTube embed format: e.g. <code>https://www.youtube.com/embed/4kHRN2gCa1k</code></span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'faqs' && (
                  <div className="edit-pane">
                    {/* FAQs Section */}
                    <div className="pane-header">
                      <h3>Event FAQs</h3>
                      <button className="btn btn--add" onClick={handleAddFaq}>
                        <RiAddLine /> Add FAQ
                      </button>
                    </div>
                    <p className="pane-desc">Manage questions and answers displayed in Accordion.</p>

                    <div className="list-editor mb-8">
                      {faqs.length === 0 ? (
                        <p className="empty-msg">No FAQs in list. Click "Add FAQ" to insert one.</p>
                      ) : (
                        faqs.map((item, index) => (
                          <div key={index} className="list-item-box">
                            <div className="list-item-header">
                              <span>FAQ #{index + 1}</span>
                              <button 
                                className="delete-icon-btn" 
                                onClick={() => handleRemoveFaq(index)}
                                title="Delete FAQ"
                              >
                                <RiDeleteBinLine size={18} />
                              </button>
                            </div>
                            <div className="form-grid">
                              <div className="form-group col-span-2">
                                <label>Question <span style={{ color: '#ff4d4f' }}>*</span></label>
                                <input
                                  type="text"
                                  value={item.question || ''}
                                  onChange={(e) => {
                                    const newFaqs = [...faqs];
                                    newFaqs[index].question = e.target.value;
                                    setFaqs(newFaqs);
                                  }}
                                />
                              </div>
                              <div className="form-group col-span-2">
                                <label>Answer <span style={{ color: '#ff4d4f' }}>*</span></label>
                                <textarea
                                  rows="2"
                                  value={item.answer || ''}
                                  onChange={(e) => {
                                    const newFaqs = [...faqs];
                                    newFaqs[index].answer = e.target.value;
                                    setFaqs(newFaqs);
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Terms and Conditions Section */}
                    <div className="pane-header border-t pt-6">
                      <h3>Terms & Conditions</h3>
                      <button className="btn btn--add" onClick={handleAddTerm}>
                        <RiAddLine /> Add Rule
                      </button>
                    </div>
                    <p className="pane-desc">Manage items showing in T&C section of Footer.</p>

                    <div className="list-editor">
                      {termsAndConditions.map((term, index) => (
                        <div key={index} className="term-item-line">
                          <input
                            type="text"
                            value={term}
                            onChange={(e) => {
                              const newTerms = [...termsAndConditions];
                              newTerms[index] = e.target.value;
                              setTermsAndConditions(newTerms);
                            }}
                          />
                          <button 
                            className="delete-icon-btn"
                            onClick={() => handleRemoveTerm(index)}
                            title="Delete Rule"
                          >
                            <RiDeleteBinLine size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'github' && (
                  <div className="edit-pane">
                    <h3>GitHub Configuration Settings</h3>
                    <p className="pane-desc">Configure the repository connection details for committing data updates.</p>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>Repository Owner (GitHub Username) <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="text"
                          value={githubConfig.owner}
                          onChange={(e) => setGithubConfig({ ...githubConfig, owner: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Repository Name <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="text"
                          value={githubConfig.repo}
                          onChange={(e) => setGithubConfig({ ...githubConfig, repo: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Target Branch <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="text"
                          value={githubConfig.branch}
                          onChange={(e) => setGithubConfig({ ...githubConfig, branch: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>JSON Data File Path <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="text"
                          value={githubConfig.path}
                          onChange={(e) => setGithubConfig({ ...githubConfig, path: e.target.value })}
                        />
                      </div>

                      <div className="form-group col-span-2 pt-4 border-t mt-4 flex justify-between align-center">
                        <div>
                          <h4>GitHub Personal Access Token</h4>
                          <p className="text-muted text-xs">Used to authorize operations on your repository.</p>
                        </div>
                        <button 
                          className="btn-link-reset text-gold text-sm"
                          onClick={() => {
                            localStorage.removeItem('bw_coupon_admin_github_token');
                            setGithubToken('');
                            setIsLoggedIn(false);
                          }}
                        >
                          Clear Saved Token & Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'googleFormConfig' && (
                  <div className="edit-pane">
                    <h3>Google Form & Sheet Integration</h3>
                    <p className="pane-desc">Manage the connection links and entry keys for Google Sheets and Google Forms.</p>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                      {googleFormConfig.sheetLink && (
                        <a 
                          href={googleFormConfig.sheetLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn--secondary"
                          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          Open Google Sheet
                        </a>
                      )}
                      {googleFormConfig.formLink && (
                        <a 
                          href={googleFormConfig.formLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn--secondary"
                          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          Open Google Form
                        </a>
                      )}
                    </div>

                    <div className="form-grid">
                      <div className="form-group col-span-2">
                        <label>Google Sheet Link (For Admin Reference) <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="text"
                          value={googleFormConfig.sheetLink || ''}
                          onChange={(e) => setGoogleFormConfig({ ...googleFormConfig, sheetLink: e.target.value })}
                          placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                        />
                      </div>

                      <div className="form-group col-span-2">
                        <label>Google Form Link (For Reference) <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="text"
                          value={googleFormConfig.formLink || ''}
                          onChange={(e) => setGoogleFormConfig({ ...googleFormConfig, formLink: e.target.value })}
                          placeholder="https://docs.google.com/forms/d/e/.../viewform"
                        />
                      </div>

                      <div className="form-group col-span-2">
                        <label>Google Form Response Action URL (POST Endpoint) <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="text"
                          value={googleFormConfig.actionUrl || ''}
                          onChange={(e) => setGoogleFormConfig({ ...googleFormConfig, actionUrl: e.target.value })}
                          placeholder="https://docs.google.com/forms/d/e/.../formResponse"
                        />
                      </div>

                      <div className="form-group">
                        <label>Name Field Entry ID <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="text"
                          value={googleFormConfig.entryName || ''}
                          onChange={(e) => setGoogleFormConfig({ ...googleFormConfig, entryName: e.target.value })}
                          placeholder="entry.1615974480"
                        />
                      </div>

                      <div className="form-group">
                        <label>Email Field Entry ID <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="text"
                          value={googleFormConfig.entryEmail || ''}
                          onChange={(e) => setGoogleFormConfig({ ...googleFormConfig, entryEmail: e.target.value })}
                          placeholder="entry.893730115"
                        />
                      </div>

                      <div className="form-group">
                        <label>Phone Field Entry ID <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="text"
                          value={googleFormConfig.entryPhone || ''}
                          onChange={(e) => setGoogleFormConfig({ ...googleFormConfig, entryPhone: e.target.value })}
                          placeholder="entry.1905815953"
                        />
                      </div>

                      <div className="form-group col-span-2">
                        <label>Target Subsheet (Tab) Name <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="text"
                          value={googleFormConfig.subsheetName || ''}
                          onChange={(e) => setGoogleFormConfig({ ...googleFormConfig, subsheetName: e.target.value })}
                          placeholder="e.g. Bhopal June 2026"
                        />
                      </div>

                      <div className="form-group col-span-2">
                        <label>Subsheet Field Google Form Entry ID <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="text"
                          value={googleFormConfig.entrySubsheet || ''}
                          onChange={(e) => setGoogleFormConfig({ ...googleFormConfig, entrySubsheet: e.target.value })}
                          placeholder="e.g. entry.987654321"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dashboard Footer Action Panel */}
            <div className="admin-dashboard__footer">
              <span className="info-badge">
                <RiInformationLine /> Any saved changes will trigger a GitHub commit, prompting the server to rebuild.
              </span>
              <div className="actions">
                <button className="btn btn--secondary" onClick={() => setIsLoggedIn(false)}>
                  Lock Console
                </button>
                <button 
                  className="btn btn--save" 
                  onClick={handleSave} 
                  disabled={status === 'saving'}
                >
                  <RiSaveLine /> Save to GitHub
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
      {showAddVideoModal && (
        <div className="admin-sub-modal-overlay">
          <motion.div 
            className="admin-sub-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="sub-modal-header">
              <h3>Add New Video Reel</h3>
              <button className="close-btn" onClick={() => setShowAddVideoModal(false)}>
                <RiCloseLine size={20} />
              </button>
            </div>
            
            <div className="sub-modal-body">
              <div className="form-group">
                <label>YouTube Embed Video URL</label>
                <div className="input-wrapper input-wrapper--url">
                  <RiYoutubeLine className="input-icon text-red" />
                  <input
                    type="text"
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/XXXXXX"
                  />
                </div>
                <span className="input-subtext">Must be standard YouTube embed format: e.g. <code>https://www.youtube.com/embed/4kHRN2gCa1k</code></span>
              </div>
            </div>

            <div className="sub-modal-footer">
              <button 
                type="button" 
                className="btn btn--secondary" 
                onClick={() => setShowAddVideoModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn--primary" 
                onClick={handleConfirmAddTestimonial}
              >
                Add Video Reel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showAddFaqModal && (
        <div className="admin-sub-modal-overlay">
          <motion.div 
            className="admin-sub-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="sub-modal-header">
              <h3>Add New FAQ</h3>
              <button className="close-btn" onClick={() => setShowAddFaqModal(false)}>
                <RiCloseLine size={20} />
              </button>
            </div>
            
            <div className="sub-modal-body">
              <div className="form-group">
                <label>Question <span style={{ color: '#ff4d4f' }}>*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. How do I redeem my flat ₹500 OFF coupon?"
                  value={newFaqQuestion}
                  onChange={(e) => setNewFaqQuestion(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Answer <span style={{ color: '#ff4d4f' }}>*</span></label>
                <textarea 
                  rows="4"
                  placeholder="Details and explanation here..."
                  value={newFaqAnswer}
                  onChange={(e) => setNewFaqAnswer(e.target.value)}
                />
              </div>
            </div>

            <div className="sub-modal-footer">
              <button 
                type="button" 
                className="btn btn--secondary" 
                onClick={() => setShowAddFaqModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn--primary" 
                onClick={handleConfirmAddFaq}
              >
                Add FAQ
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showAddTermModal && (
        <div className="admin-sub-modal-overlay">
          <motion.div 
            className="admin-sub-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="sub-modal-header">
              <h3>Add New Term & Condition</h3>
              <button className="close-btn" onClick={() => setShowAddTermModal(false)}>
                <RiCloseLine size={20} />
              </button>
            </div>
            
            <div className="sub-modal-body">
              <div className="form-group">
                <label>Term Text <span style={{ color: '#ff4d4f' }}>*</span></label>
                <textarea 
                  rows="4"
                  placeholder="Enter term details..."
                  value={newTermText}
                  onChange={(e) => setNewTermText(e.target.value)}
                />
              </div>
            </div>

            <div className="sub-modal-footer">
              <button 
                type="button" 
                className="btn btn--secondary" 
                onClick={() => setShowAddTermModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn--primary" 
                onClick={handleConfirmAddTerm}
              >
                Add Term
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {showAddImageModal && (
        <div className="admin-sub-modal-overlay">
          <motion.div 
            className="admin-sub-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="sub-modal-header">
              <h3>Add New Image to Gallery</h3>
              <button className="close-btn" onClick={() => setShowAddImageModal(false)}>
                <RiCloseLine size={20} />
              </button>
            </div>
            
            <div className="sub-modal-body">
              {/* Image Source Selection */}
              <div className="form-group">
                <label>Image Source</label>
                <div className="image-source-options">
                  <div className="source-upload-zone">
                    {newImageLocalPreview ? (
                      <div className="new-image-preview-box">
                        <img src={newImageLocalPreview} alt="Preview" />
                        <button className="remove-preview-btn" onClick={() => {
                          setNewImageFile(null);
                          setNewImageLocalPreview('');
                        }}>Remove</button>
                      </div>
                    ) : (
                      <label className="file-upload-label">
                        <RiAddLine size={24} />
                        <span>Upload Local Image</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setNewImageFile(file);
                              setNewImageLocalPreview(URL.createObjectURL(file));
                              setNewImageUrl(''); // Clear text URL if file is selected
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                  
                  {!newImageLocalPreview && (
                    <>
                      <div className="or-divider"><span>OR</span></div>
                      <div className="form-group">
                        <label>Or Paste Image URL</label>
                        <input 
                          type="text" 
                          placeholder="https://example.com/image.jpg"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Caption <span style={{ color: '#ff4d4f' }}>*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. Designer Haute Couture"
                  value={newImageCaption}
                  onChange={(e) => setNewImageCaption(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Category (Filter Group) <span style={{ color: '#ff4d4f' }}>*</span></label>
                <select
                  value={newImageCategory}
                  onChange={(e) => setNewImageCategory(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(10, 10, 10, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    padding: '0.65rem 1rem',
                    color: '#fff',
                    outline: 'none'
                  }}
                >
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sub-modal-footer">
              <button 
                type="button" 
                className="btn btn--secondary" 
                onClick={() => setShowAddImageModal(false)}
                disabled={isUploadingNewImage}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn--primary" 
                onClick={handleAddNewGalleryItem}
                disabled={isUploadingNewImage}
              >
                {isUploadingNewImage ? 'Uploading...' : 'Add Image'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminModal;
