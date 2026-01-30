/**
 * Utility functions for date handling in the application
 */

/**
 * Parses a date string in various formats and returns a JavaScript Date object
 * @param {string} dateString - The date string to parse
 * @returns {Date|null} - The parsed Date object or null if invalid
 */
function parseDate(dateString) {
  if (!dateString) {
    console.log("DateUtils: Null or undefined date string provided");
    return null;
  }
  
  try {
    console.log(`DateUtils: Attempting to parse date string: "${dateString}"`);
    
    // Check if the date is in ISO format (contains T or Z)
    if (typeof dateString === 'string' && (dateString.includes('T') || dateString.includes('Z'))) {
      console.log("DateUtils: Detected ISO format date string");
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        console.log(`DateUtils: Successfully parsed ISO date: ${date.toISOString()}`);
        return date;
      } else {
        console.log("DateUtils: Failed to parse ISO string");
      }
    }
    
    // Handle DD-MM-YYYY format
    if (typeof dateString === 'string' && dateString.split('-').length === 3) {
      const parts = dateString.split('-');
      console.log(`DateUtils: Split date parts: [${parts.join(', ')}]`);
      
      // Check if first part looks like a day (1-31)
      if (parseInt(parts[0]) <= 31 && parseInt(parts[0]) > 0) {
        console.log("DateUtils: Detected DD-MM-YYYY format");
        const [day, month, year] = parts.map(Number);
        // Create date at noon to avoid timezone issues
        const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
        if (!isNaN(date.getTime())) {
          console.log(`DateUtils: Successfully parsed DD-MM-YYYY: ${date.toISOString()}`);
          return date;
        }
      } 
      // Check if it's in YYYY-MM-DD format
      else if (parseInt(parts[0]) > 31) {
        console.log("DateUtils: Detected YYYY-MM-DD format");
        const [year, month, day] = parts.map(Number);
        // Create date at noon to avoid timezone issues
        const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
        if (!isNaN(date.getTime())) {
          console.log(`DateUtils: Successfully parsed YYYY-MM-DD: ${date.toISOString()}`);
          return date;
        }
      }
    }
    
    // If the input is already a Date object, return it
    if (dateString instanceof Date) {
      console.log("DateUtils: Input is already a Date object");
      if (!isNaN(dateString.getTime())) {
        console.log(`DateUtils: Valid Date object: ${dateString.toISOString()}`);
        return dateString;
      } else {
        console.log("DateUtils: Invalid Date object (NaN)");
        return null;
      }
    }
    
    // Fallback - try to directly parse
    console.log("DateUtils: Attempting fallback parsing");
    const parsedDate = new Date(dateString);
    if (!isNaN(parsedDate.getTime())) {
      console.log(`DateUtils: Fallback parsing successful: ${parsedDate.toISOString()}`);
      return parsedDate;
    }
    
    console.log("DateUtils: All parsing attempts failed");
    return null; // Return null for invalid dates
  } catch (error) {
    console.error("DateUtils: Error parsing date:", error, dateString);
    return null;
  }
}

/**
 * Converts a date to a MongoDB-compatible format string (YYYY-MM-DD)
 * This can be safely used in MongoDB date operations
 * @param {Date|string} date - The date to convert
 * @returns {string|null} - Formatted YYYY-MM-DD string or null if invalid
 */
function toMongoDateFormat(date) {
  const parsedDate = typeof date === 'string' ? parseDate(date) : date;
  
  if (!parsedDate || isNaN(parsedDate.getTime())) {
    console.log("DateUtils: Cannot convert invalid date to MongoDB format");
    return null;
  }
  
  // Format as YYYY-MM-DD which is safe for MongoDB date operations
  const year = parsedDate.getUTCFullYear();
  const month = String(parsedDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date as DD-MM-YYYY for consistent storage
 * @param {Date|string} date - Date object or string to format
 * @returns {string} - Formatted date string
 */
function formatDateDDMMYYYY(date) {
  // Store original input for reference
  const originalInput = date;
  
  // Parse the date if it's a string
  const parsedDate = typeof date === 'string' ? parseDate(date) : date;
  
  if (!parsedDate || isNaN(parsedDate.getTime())) {
    console.log("DateUtils: Cannot format invalid date to DD-MM-YYYY");
    return '';
  }
  
  // Get UTC components for consistent date handling
  const day = String(parsedDate.getUTCDate()).padStart(2, '0');
  const month = String(parsedDate.getUTCMonth() + 1).padStart(2, '0');
  const year = parsedDate.getUTCFullYear();
  
  const formatted = `${day}-${month}-${year}`;
  console.log(`DateUtils: Formatted date to DD-MM-YYYY: ${formatted}`);
  return formatted;
}

/**
 * Formats a date as ISO string for storage
 * @param {Date|string} date - Date object or string to format
 * @returns {string} - Formatted date string in ISO format
 */
function formatDateISO(date) {
  const parsedDate = typeof date === 'string' ? parseDate(date) : date;
  
  if (!parsedDate || isNaN(parsedDate.getTime())) {
    console.log("DateUtils: Cannot format invalid date to ISO");
    return '';
  }
  
  const formatted = parsedDate.toISOString();
  console.log(`DateUtils: Formatted date to ISO: ${formatted}`);
  return formatted;
}

/**
 * Checks if a date string is in ISO format
 * @param {string} dateString - The date string to check
 * @returns {boolean} - True if the string is in ISO format
 */
function isISODate(dateString) {
  if (typeof dateString !== 'string') return false;
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(dateString);
}

module.exports = {
  parseDate,
  formatDateDDMMYYYY,
  formatDateISO,
  toMongoDateFormat,
  isISODate
}; 