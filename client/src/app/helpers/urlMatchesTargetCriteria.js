/**
 * Checks if a URL matches the given targeting criteria based on include/exclude rules
 * @param {string} url - The URL to check
 * @param {Object} rules - The advanced URL rules containing include and exclude patterns
 * @param {Array} rules.exclude - Array of {type: 'contains'|'exact', url: string} objects
 * @param {Array} rules.include - Array of {type: 'contains'|'exact', url: string} objects
 * @returns {boolean} - Whether the URL matches the targeting criteria
 */
function urlMatchesTargetCriteria(url, rules) {
  // If no rules provided, allow by default
  if (!rules) {
    return true;
  }

  const { exclude, include } = rules;

  // Check exclude rules first
  if (exclude?.length > 0) {
    for (const rule of exclude) {
      if (rule.type === 'contains' && url.includes(rule.url)) {
        return false;
      }
      if (rule.type === 'exact' && url === rule.url) {
        return false;
      }
    }
  }

  // Check include rules
  if (include?.length > 0) {
    return include.some((rule) => {
      if (rule.type === 'contains' && url.includes(rule.url)) {
        return true;
      }
      if (rule.type === 'exact' && url === rule.url) {
        return true;
      }
      return false;
    });
  }

  // If no include rules specified, allow by default after exclude checks
  return true;
}

export default urlMatchesTargetCriteria;
