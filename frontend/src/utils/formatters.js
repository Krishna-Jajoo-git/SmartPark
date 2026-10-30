/**
 * Currency & Timestamp formatting utilities for SmartPark
 */

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0.00';
  return `₹${num.toFixed(2)}`;
};

export const formatDateTime = (isoString) => {
  if (!isoString) return '--';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
};

export const formatDateOnly = (isoStringOrDate) => {
  if (!isoStringOrDate) return '--';
  try {
    const d = new Date(isoStringOrDate);
    if (isNaN(d.getTime())) return String(isoStringOrDate);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(isoStringOrDate);
  }
};

export const formatDurationFromSeconds = (seconds) => {
  if (!seconds || seconds <= 0) return '0s';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (hrs > 0) parts.push(`${hrs}h`);
  if (mins > 0 || hrs > 0) parts.push(`${mins}m`);
  parts.push(`${secs}s`);
  return parts.join(' ');
};

export const cleanVehicleNumber = (val) => {
  if (!val) return '';
  return val.toUpperCase().replace(/[^A-Z0-9 -]/g, '');
};
