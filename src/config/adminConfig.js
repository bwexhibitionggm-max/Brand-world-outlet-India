/**
 * Admin Panel Credentials, GitHub Repository Configuration, and ImageKit CDN Settings
 */

export const ADMIN_CREDENTIALS = {
  username: import.meta.env.VITE_ADMIN_USERNAME || 'admin',
  password: import.meta.env.VITE_ADMIN_PASSWORD || 'password123'
};

export const GITHUB_CONFIG = {
  owner: import.meta.env.VITE_GITHUB_OWNER || 'zeelnpatel5-wq',
  repo: import.meta.env.VITE_GITHUB_REPO || 'BW_exhibition_coupon',
  path: import.meta.env.VITE_GITHUB_PATH || 'src/data/exhibitionData.json',
  branch: import.meta.env.VITE_GITHUB_BRANCH || 'feat/inhasment'
};

export const IMAGEKIT_CONFIG = {
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/kuzfysjng',
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || 'public_ivBA6FhJVjetXoeyxuRrDKI4vSc='
};
