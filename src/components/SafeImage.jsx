import { useState, useEffect, forwardRef } from 'react';
import { GITHUB_CONFIG } from '../config/adminConfig';

const IMAGEKIT_ENDPOINT = (import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/kuzfysjng').replace(/\/$/, '');

const SafeImage = forwardRef(({ src, alt, className, onError, ...props }, ref) => {
  const [resolvedSrc, setResolvedSrc] = useState(src);
  const [fallbackStep, setFallbackStep] = useState(0);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem('bw_coupon_admin_github_token');

    const resolve = async () => {
      if (!src) {
        if (active) setResolvedSrc(src);
        return;
      }

      let currentSrc = src;
      if (src.startsWith('https://raw.githubusercontent.com/')) {
        const publicGalleryIdx = src.indexOf('/public/gallery/');
        if (publicGalleryIdx !== -1) {
          currentSrc = src.substring(publicGalleryIdx + 7); // e.g., "/gallery/filename.png"
        }
      }

      // Case 1: Relative gallery or asset path (e.g., /gallery/filename.png)
      if (currentSrc.startsWith('/gallery/') || currentSrc.startsWith('gallery/')) {
        const cleanPath = currentSrc.startsWith('/') ? currentSrc : `/${currentSrc}`;
        const ikUrl = `${IMAGEKIT_ENDPOINT}${cleanPath}`;
        
        if (active) {
          setResolvedSrc(ikUrl);
          setFallbackStep(0);
        }
        return;
      }

      // Case 2: Raw GitHub URL fallback
      if (currentSrc.startsWith('https://raw.githubusercontent.com/')) {
        if (token) {
          try {
            let owner = GITHUB_CONFIG.owner;
            let repo = GITHUB_CONFIG.repo;
            let branch = GITHUB_CONFIG.branch;
            let path = '';

            const prefix = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`;
            if (currentSrc.startsWith(prefix)) {
              path = currentSrc.replace(prefix, '');
            } else {
              const parts = currentSrc.replace('https://raw.githubusercontent.com/', '').split('/');
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
              if (res.ok && active) {
                const data = await res.json();
                if (data.content) {
                  setResolvedSrc(`data:image/png;base64,${data.content.replace(/\s/g, '')}`);
                  return;
                }
              }
            }
          } catch (e) {
            console.error('Failed to resolve raw GitHub image', e);
          }
        }
      }

      // Default fallback
      if (active) {
        setResolvedSrc(currentSrc);
      }
    };

    resolve();

    return () => {
      active = false;
    };
  }, [src]);

  const handleError = (e) => {
    let cleanPath = src;
    if (src && src.startsWith('https://raw.githubusercontent.com/')) {
      const publicGalleryIdx = src.indexOf('/public/gallery/');
      if (publicGalleryIdx !== -1) {
        cleanPath = src.substring(publicGalleryIdx + 7);
      }
    }

    if (fallbackStep === 0 && cleanPath && (cleanPath.startsWith('/gallery/') || cleanPath.startsWith('gallery/'))) {
      // Fallback 1: Local image path
      setFallbackStep(1);
      e.target.src = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    } else if (fallbackStep <= 1 && src) {
      // Fallback 2: Placeholder image
      setFallbackStep(2);
      e.target.src = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800';
    }

    if (onError) {
      onError(e);
    }
  };

  return (
    <img 
      ref={ref}
      src={resolvedSrc} 
      alt={alt} 
      className={className} 
      onError={handleError}
      {...props} 
    />
  );
});

export default SafeImage;
