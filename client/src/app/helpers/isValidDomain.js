/**
 * Validates if a string is a properly formatted domain name.
 * Rules:
 * - Must contain at least one dot
 * - Must not contain spaces or special characters except hyphen (-)
 * - Must not start or end with a hyphen
 * - Must not be longer than 253 characters
 * - Each label (part between dots) must:
 *   - Be between 1 and 63 characters
 *   - Only contain letters, numbers, and hyphens
 *   - Not start or end with a hyphen
 *
 * @param {string} domain - The domain string to validate
 * @returns {boolean} - True if domain is valid, false otherwise
 */
const isValidDomain = (domain) => {
  if (!domain || typeof domain !== 'string') return false;

  // Check total length
  if (domain.length > 253) return false;

  // Remove trailing dot if present
  domain = domain.replace(/\.$/, '');

  // Basic format check
  const basicFormatRegex = /^[a-zA-Z0-9][a-zA-Z0-9-\.]*[a-zA-Z0-9]$/;
  if (!basicFormatRegex.test(domain)) return false;

  // Must have at least one dot
  if (!domain.includes('.')) return false;

  // Check each label
  const labels = domain.split('.');
  const isValidLabel = (label) => {
    return (
      label.length >= 1 &&
      label.length <= 63 &&
      !label.startsWith('-') &&
      !label.endsWith('-') &&
      /^[a-zA-Z0-9-]+$/.test(label)
    );
  };

  return labels.every(isValidLabel);
};

export default isValidDomain;
