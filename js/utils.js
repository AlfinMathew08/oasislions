// Utility helpers for DOM formatting, toast notices, dates and safe sanitization

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatUAEEventDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    timeZone: 'Asia/Dubai',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }) + ' GST';
}

export function formatUAEDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    timeZone: 'Asia/Dubai',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatUAETime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Dubai',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }) + ' GST';
}

export function formatUAEDateParts(dateString) {
  if (!dateString) return { month: 'TBD', day: '--', weekday: '', time: '', fullDate: '' };
  const date = new Date(dateString);
  const month = date.toLocaleDateString('en-US', { timeZone: 'Asia/Dubai', month: 'short' }).toUpperCase();
  const day = date.toLocaleDateString('en-US', { timeZone: 'Asia/Dubai', day: 'numeric' });
  const weekday = date.toLocaleDateString('en-US', { timeZone: 'Asia/Dubai', weekday: 'short' });
  const time = formatUAETime(dateString);
  const fullDate = formatUAEDate(dateString);
  return { month, day, weekday, time, fullDate };
}

export function sanitize(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Standardized Name Prefix Formatter
 * Applies configured prefix (Lion, Mr., Mrs., Ms., Dr., etc.) consistently
 * Prevents duplicated prefixes if name already contains one.
 */
export function formatMemberName(member) {
  if (!member) return '';
  const prefix = (member.name_prefix !== undefined ? member.name_prefix : (member.prefix || '')).trim();
  const rawName = (member.name || `${member.first_name || ''} ${member.last_name || ''}`).trim();
  if (!prefix || prefix.toLowerCase() === 'none' || prefix.toLowerCase() === 'no prefix') {
    return rawName;
  }
  const lowerPrefix = prefix.toLowerCase();
  const lowerName = rawName.toLowerCase();
  if (lowerName.startsWith(lowerPrefix + ' ') || lowerName === lowerPrefix) {
    return rawName;
  }
  return `${prefix} ${rawName}`;
}

export function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${sanitize(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
