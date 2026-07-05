/**
 * Parses event dates and timings string to extract the end date and time.
 * E.g., "June 13th – 14th, 2026" and "10:00 AM – 9:00 PM" -> Date object for June 14th, 2026 at 9:00 PM
 */
export const parseEventEndDate = (datesStr, timingsStr) => {
  if (!datesStr || typeof datesStr !== 'string') return null;

  // 1. Extract year (4-digit number)
  const yearMatch = datesStr.match(/\b\d{4}\b/);
  const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();

  // 2. Extract month
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const monthAbbrs = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  
  const lowerDatesStr = datesStr.toLowerCase();
  let monthIndex = -1;
  for (let i = 0; i < 12; i++) {
    if (lowerDatesStr.includes(months[i]) || lowerDatesStr.includes(monthAbbrs[i])) {
      monthIndex = i;
      break;
    }
  }
  if (monthIndex === -1) {
    monthIndex = new Date().getMonth();
  }

  // 3. Extract day (second 1 or 2 digit number that is not the year, or first if only one exists)
  const strWithoutYear = datesStr.replace(/\b\d{4}\b/, '');
  const dayNumbers = strWithoutYear.match(/\d+/g);
  let day = 1;
  if (dayNumbers && dayNumbers.length > 0) {
    day = dayNumbers.length >= 2 ? parseInt(dayNumbers[1]) : parseInt(dayNumbers[0]);
  }

  // 4. Extract time (second time in timings, or first if only one exists)
  let hours = 21; // default to 9:00 PM if parsing fails
  let minutes = 0;
  
  if (timingsStr && typeof timingsStr === 'string') {
    const parts = timingsStr.split(/[–\-\u2014to]/i);
    const targetPart = parts.length >= 2 ? parts[1].trim() : parts[0].trim();
    
    const timeMatch = targetPart.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1]);
      const m = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : '';
      if (ampm === 'pm' && h < 12) h += 12;
      if (ampm === 'am' && h === 12) h = 0;
      hours = h;
      minutes = m;
    }
  }

  return new Date(year, monthIndex, day, hours, minutes, 0);
};

/**
 * Formats a Date object to YYYY-MM-DDTHH:mm for datetime-local input value.
 */
export const formatDateToDatetimeLocal = (date) => {
  if (!date || isNaN(date.getTime())) return '';
  const pad = (num) => String(num).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

/**
 * Returns the ordinal suffix (st, nd, rd, th) for a given day.
 */
export const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:  return "st";
    case 2:  return "nd";
    case 3:  return "rd";
    default: return "th";
  }
};

/**
 * Parses event dates string to extract start and end dates.
 * E.g., "June 13th – 14th, 2026" -> { startDate: Date, endDate: Date }
 */
export const parseEventDateRange = (datesStr) => {
  const defaultStart = new Date();
  const defaultEnd = new Date();

  if (!datesStr || typeof datesStr !== 'string') {
    return { startDate: defaultStart, endDate: defaultEnd };
  }

  const cleanStr = datesStr.trim();
  if (!cleanStr) {
    return { startDate: defaultStart, endDate: defaultEnd };
  }

  const parts = cleanStr.split(/[–\-\u2014to]/i).map(p => p.trim());

  const parseSingleDate = (str, referenceYear, referenceMonthIndex) => {
    const yearMatch = str.match(/\b\d{4}\b/);
    const year = yearMatch ? parseInt(yearMatch[0]) : referenceYear;

    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const monthAbbrs = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    
    const lowerStr = str.toLowerCase();
    let monthIndex = -1;
    for (let i = 0; i < 12; i++) {
      if (lowerStr.includes(months[i]) || lowerStr.includes(monthAbbrs[i])) {
        monthIndex = i;
        break;
      }
    }
    if (monthIndex === -1) {
      monthIndex = referenceMonthIndex !== undefined ? referenceMonthIndex : new Date().getMonth();
    }

    const strWithoutYear = str.replace(/\b\d{4}\b/, '');
    const dayNumbers = strWithoutYear.match(/\d+/g);
    let day = 1;
    if (dayNumbers && dayNumbers.length > 0) {
      day = parseInt(dayNumbers[0]);
    }

    return new Date(year, monthIndex, day);
  };

  const yearMatch = cleanStr.match(/\b\d{4}\b/);
  const commonYear = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();

  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const monthAbbrs = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const lowerStr = cleanStr.toLowerCase();
  let commonMonthIndex = new Date().getMonth();
  for (let i = 0; i < 12; i++) {
    if (lowerStr.includes(months[i]) || lowerStr.includes(monthAbbrs[i])) {
      commonMonthIndex = i;
      break;
    }
  }

  if (parts.length === 1) {
    const d = parseSingleDate(parts[0], commonYear, commonMonthIndex);
    return { startDate: d, endDate: new Date(d.getTime()) };
  } else {
    const end = parseSingleDate(parts[1], commonYear, commonMonthIndex);
    const start = parseSingleDate(parts[0], end.getFullYear(), end.getMonth());
    return { startDate: start, endDate: end };
  }
};

/**
 * Formats a start and end date into a pretty readable date range string.
 * E.g., June 13, 2026 and June 14, 2026 -> "June 13th – 14th, 2026"
 */
export const formatEventDateRange = (start, end) => {
  if (!start || isNaN(start.getTime())) return '';
  if (!end || isNaN(end.getTime())) return '';

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const startYear = start.getFullYear();
  const startMonth = months[start.getMonth()];
  const startDay = start.getDate();
  const startDayStr = `${startDay}${getOrdinalSuffix(startDay)}`;

  const endYear = end.getFullYear();
  const endMonth = months[end.getMonth()];
  const endDay = end.getDate();
  const endDayStr = `${endDay}${getOrdinalSuffix(endDay)}`;

  if (startYear === endYear) {
    if (startMonth === endMonth) {
      if (startDay === endDay) {
        return `${startMonth} ${startDayStr}, ${startYear}`;
      }
      return `${startMonth} ${startDayStr} – ${endDayStr}, ${startYear}`;
    }
    return `${startMonth} ${startDayStr} – ${endMonth} ${endDayStr}, ${startYear}`;
  }
  return `${startMonth} ${startDayStr}, ${startYear} – ${endMonth} ${endDayStr}, ${endYear}`;
};

/**
 * Formats a term by replacing default venue and date references with dynamic details.
 */
export const formatTerm = (term, eventDetails) => {
  if (!term || typeof term !== 'string') return '';
  if (!eventDetails) return term;

  let formatted = term;

  const venue = eventDetails.venue || '';
  const dates = eventDetails.dates || '';
  const couponValue = eventDetails.couponValue || '';
  const timings = eventDetails.timings || '';

  // 1. Replace placeholder tags dynamically
  formatted = formatted.replace(/{venue}/g, venue);
  formatted = formatted.replace(/{dates}/g, dates);
  formatted = formatted.replace(/{couponValue}/g, couponValue);
  formatted = formatted.replace(/{timings}/g, timings);

  // 2. Legacy fallback replacements for static text patterns:
  formatted = formatted.replace(/Radisson Hotel Bhopal/g, venue);
  formatted = formatted.replace(/June 25-28, 2026/g, dates);
  formatted = formatted.replace(/June 25th\s*[–-–]\s*28th,\s*2026/g, dates);
  
  const match = couponValue.match(/(₹?\s*\d+(?:,\d+)*)/);
  const val = match ? match[1] : '';
  formatted = formatted.replace(/₹500/g, val);

  return formatted;
};

