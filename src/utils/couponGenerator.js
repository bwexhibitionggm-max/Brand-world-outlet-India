/**
 * Generates a random alphanumeric coupon code
 * Format: OFF500-XXXXXX where X is uppercase letters or digits
 */
export const generateCouponCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomPart += chars[randomIndex];
  }
  return `OFF500-${randomPart}`;
};
