import { useState, useEffect, forwardRef } from 'react';
import { GITHUB_CONFIG } from '../config/adminConfig';

const SafeImage = forwardRef(({ src, alt, className, ...props }, ref) => {
  const [resolvedSrc, setResolvedSrc] = useState(src);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem('bw_coupon_admin_github_token');

    const resolve = async () => {
      if (!src) {
        if (active) setResolvedSrc(src);
        return;
      }

      // Convert raw GitHub URLs pointing to public/gallery to local relative paths
      let currentSrc = src;
      if (src.startsWith('https://raw.githubusercontent.com/')) {
        const publicGalleryIdx = src.indexOf('/public/gallery/');
        if (publicGalleryIdx !== -1) {
          currentSrc = src.substring(publicGalleryIdx + 7); // e.g., "/gallery/filename.png"
        }
      }

      // Case 1: Relative Gallery path (e.g. /gallery/filename.png)
      if (currentSrc.startsWith('/gallery/')) {
        // First check if the file is available locally to avoid redundant GitHub API calls
        try {
          const localCheck = await fetch(currentSrc, { method: 'HEAD' });
          if (localCheck.ok) {
            if (active) {
              setResolvedSrc(currentSrc);
              return;
            }
          }
        } catch (err) {
          console.warn('Local image check failed:', err);
        }

        // If not available locally, try to resolve via GitHub if in local dev and token exists
        const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocalDev && token) {
          try {
            const owner = GITHUB_CONFIG.owner;
            const repo = GITHUB_CONFIG.repo;
            const branch = GITHUB_CONFIG.branch;
            const path = `public${currentSrc}`; // Maps to public/gallery/filename.png
            
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
          } catch (e) {
            console.error('Failed to resolve local development gallery image from GitHub', e);
          }
        }
      }

      // Case 2: Raw GitHub URL (fallback support for non-gallery or other GitHub files)
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
    if (src && (src.startsWith('/gallery/') || src.startsWith('https://raw.githubusercontent.com/'))) {
      e.target.src = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800';
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
