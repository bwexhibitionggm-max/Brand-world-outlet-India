/**
 * Admin Panel Credentials and GitHub Repository Configuration
 * 
 * NOTE: You can edit the username and password here to secure your admin panel.
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
