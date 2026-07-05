# BW Exhibition India - Premium Coupon Landing Page

This is a premium, modern, fully responsive React.js landing page built with Vite and SCSS for **BW Exhibition India**. It features a ₹500 FLAT OFF coupon collection campaign inspired by luxury fashion event landing pages.

---

## 🚀 Getting Started

Follow these steps to run the project locally:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18.0.0 or higher is recommended).

### 2. Installation
Navigate to the project directory and install the dependencies:
```bash
# Navigate to project folder
cd "E:\Samarth web"

# Install all npm dependencies
npm install
```

### 3. Running in Development
Start the local development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173` (or the port specified in terminal).

### 4. Production Build
To build the application for production deployment:
```bash
# Build the production package
npm run build

# Preview the built site locally
npm run preview
```

---

## 🛠️ Tech Stack & Required Libraries
* **Framework**: React.js + Vite (JavaScript)
* **Styling**: SCSS (structured architecture with variables, global rules, and component styles)
* **Animations**: `framer-motion` (smooth scroll, transitions, reels hover effects)
* **Icons**: `react-icons` (icons for navigation, contact info, and features)
* **Screenshot & Export**: `html2canvas` (converts the responsive coupon ticket into a high-res PNG image)

---

## 📋 Google Forms & Sheets Integration Guide
The website stores form submissions in **Google Sheets** using a **Google Form** as a bridge (requiring no backend server).

### Step-by-Step Instructions:

1. **Create the Google Form**:
   * Go to [Google Forms](https://docs.google.com/forms/) and create a new blank form.
   * Add three text fields:
     1. **Name** (Short Answer)
     2. **Email** (Short Answer)
     3. **Phone Number** (Short Answer)

2. **Link Form to a Google Sheet**:
   * In your Google Form editor, click on the **Responses** tab.
   * Click the green **Link to Sheets** (or Create Sheet) button. This creates a spreadsheet that automatically updates when someone submits the form.

3. **Get the Form Action URL**:
   * Click the **Send** button on the top right, then click the Link icon to get the link. Copy it.
   * Paste the link in your browser to open the public **Preview** version of your form.
   * Right-click anywhere on the page, select **Inspect** (F12) to open developer tools, and navigate to the **Network** tab.
   * Submit the form with dummy data.
   * Look for a network request labeled `formResponse` (it will be a POST request).
   * Copy the **Request URL** (e.g., `https://docs.google.com/forms/u/0/d/e/1FAIpQLSfXXXXXX/formResponse`).

4. **Find the Field Entry IDs**:
   * Go back to the public **Preview** form page.
   * Right-click the input field for **Name** and click **Inspect**.
   * Look at the `<input>` element and find its `name` attribute. It will look like: `name="entry.123456789"`.
   * Repeat this for the **Email** and **Phone Number** fields to get all three entry IDs.

5. **Update Configuration File**:
   * Open the file [googleForm.js](file:///E:/Samarth%20web/src/config/googleForm.js).
   * Replace the placeholders with your retrieved URL and entry IDs:
     ```javascript
     export const GOOGLE_FORM_CONFIG = {
       actionUrl: 'https://docs.google.com/forms/u/0/d/e/YOUR_FORM_ID/formResponse',
       entries: {
         name: 'entry.YOUR_NAME_ENTRY_ID',
         email: 'entry.YOUR_EMAIL_ENTRY_ID',
         phone: 'entry.YOUR_PHONE_ENTRY_ID'
       }
     };
     ```

---

## 🎟️ Coupon Generation & Download Feature

### 1. Frontend Coupon Generator Utility
The unique 6-character alphanumeric code is generated dynamically on the client side using a custom utility.
* **Code location**: [couponGenerator.js](file:///E:/Samarth%20web/src/utils/couponGenerator.js)
* **Code format**: `OFF500-XXXXXX` (e.g. `OFF500-Z3B8W9`)

### 2. Download Coupon Feature (html2canvas)
The **Download Coupon** button captures the HTML layout of the Coupon ticket (complete with border dashes, profile credentials, coupon codes, and branding logos) and parses it into a high-density PNG file.
* **Code location**: [CouponCard.jsx](file:///E:/Samarth%20web/src/components/CouponCard.jsx)
* **Implementation Details**:
  ```javascript
  const element = couponRef.current;
  html2canvas(element, {
    scale: 3,                 // Enhances quality of fonts and SVG logo
    useCORS: true,            // Permits fetching external images
    backgroundColor: '#0a0a0a' // Fills notches cleanly
  }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `BW_EXHIBITION_COUPON_${userData.couponCode}.png`;
    link.href = imgData;
    link.click();
  });
  ```
# Brand-world-outlet-India
