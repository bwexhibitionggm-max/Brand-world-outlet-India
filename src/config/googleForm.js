/**
 * Google Sheet/Form Integration Configuration
 * 
 * Connected Google Sheet:
 * https://docs.google.com/spreadsheets/d/1M8fqlqVeAAu2PiTay1C_6ZIheUynCgRME_k7uOQU3jc/edit
 * 
 * Connected Google Form:
 * https://docs.google.com/forms/d/e/1FAIpQLSe6SajxE4m6M-uOHUVyR1_qTCx4eIm6tJMVofV6lNwrFhx_hQ/viewform
 */

export const GOOGLE_FORM_CONFIG = {
  // Google Form POST action URL
  actionUrl: 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSe6SajxE4m6M-uOHUVyR1_qTCx4eIm6tJMVofV6lNwrFhx_hQ/formResponse', 
  
  // Extracted entry keys for your specific Google Form fields
  entries: {
    name: 'entry.1615974480',   // entry ID for Full Name
    email: 'entry.893730115',   // entry ID for Email Address
    phone: 'entry.1905815953',  // entry ID for Mobile Number
    subsheet: 'entry.subsheet_placeholder' // entry ID for Subsheet Name
  }
};
