const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_REGEX = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?){1,2}\d{4}\b/g;
const URL_REGEX = /\b(?:https?:\/\/|www\.)[^\s<>"']+\b/gi;
const ADDRESS_REGEX =
  /\b\d{1,6}\s+[A-Za-z0-9.\- ]+\s(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|way|parkway|pkwy)\b[^\n,]*/gi;
const LINKEDIN_REGEX = /\b(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s<>"']+\b/gi;
const PLACEHOLDER_REGEX = /\[[A-Z_]+_\d+\]|\[CANDIDATE_NAME\]/g;
const PLACEHOLDER_SINGLE_MATCH_REGEX = /\[[A-Z_]+_\d+\]|\[CANDIDATE_NAME\]/;

function createPlaceholderManager() {
  const valueToPlaceholder = new Map();
  const placeholderToValue = {};
  const counters = {
    email: 0,
    phone: 0,
    url: 0,
    address: 0,
    name: 0
  };
  const stats = {
    emailsMasked: 0,
    phonesMasked: 0,
    urlsMasked: 0,
    addressesMasked: 0,
    namesMasked: 0
  };

  const nextPlaceholder = (type) => {
    if (type === 'name') {
      return '[CANDIDATE_NAME]';
    }

    counters[type] += 1;
    return `[${type.toUpperCase()}_${counters[type]}]`;
  };

  const addValue = (value, type) => {
    const normalized = value.trim();
    if (!normalized || PLACEHOLDER_SINGLE_MATCH_REGEX.test(normalized)) {
      return normalized;
    }

    if (valueToPlaceholder.has(normalized)) {
      return valueToPlaceholder.get(normalized);
    }

    const placeholder = nextPlaceholder(type);
    valueToPlaceholder.set(normalized, placeholder);
    placeholderToValue[placeholder] = normalized;

    if (type === 'email') stats.emailsMasked += 1;
    if (type === 'phone') stats.phonesMasked += 1;
    if (type === 'url') stats.urlsMasked += 1;
    if (type === 'address') stats.addressesMasked += 1;
    if (type === 'name') stats.namesMasked += 1;

    return placeholder;
  };

  return {
    addValue,
    stats,
    placeholderMap: placeholderToValue
  };
}

function replaceMatches(input, regex, type, manager) {
  return input.replace(regex, (match) => manager.addValue(match, type));
}

function detectNameCandidate(text) {
  const inlineNameMatch = text.match(/\b([A-Z][a-z'-]+\s+[A-Z][a-z'-]+)\b/);
  if (inlineNameMatch && inlineNameMatch[1]) {
    return inlineNameMatch[1];
  }

  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8);

  for (const line of lines) {
    if (line.length < 4 || line.length > 60) continue;
    if (/[@:/|]/.test(line)) continue;
    if (/\d/.test(line)) continue;
    const words = line.split(/\s+/).filter(Boolean);
    if (words.length < 2 || words.length > 4) continue;
    if (words.every((word) => /^[A-Z][a-z'-]+$/.test(word))) {
      return line;
    }
  }

  return '';
}

function sanitizeKnownName(text, knownName, manager) {
  if (!knownName || !knownName.trim()) {
    return text;
  }

  const escaped = knownName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'g');
  return text.replace(regex, () => manager.addValue(knownName, 'name'));
}

export function sanitizeTextForLLM(text, options = {}) {
  const input = typeof text === 'string' ? text : '';
  const manager = createPlaceholderManager();
  let sanitizedText = input;

  sanitizedText = replaceMatches(sanitizedText, EMAIL_REGEX, 'email', manager);
  sanitizedText = replaceMatches(sanitizedText, PHONE_REGEX, 'phone', manager);
  sanitizedText = replaceMatches(sanitizedText, LINKEDIN_REGEX, 'url', manager);
  sanitizedText = replaceMatches(sanitizedText, URL_REGEX, 'url', manager);
  sanitizedText = replaceMatches(sanitizedText, ADDRESS_REGEX, 'address', manager);

  const detectedName = options.candidateName || detectNameCandidate(input);
  sanitizedText = sanitizeKnownName(sanitizedText, detectedName, manager);

  return {
    sanitizedText,
    placeholderMap: manager.placeholderMap,
    stats: manager.stats
  };
}

export function rehydrateFromPlaceholders(value, placeholderMap = {}) {
  if (typeof value === 'string') {
    return Object.entries(placeholderMap).reduce(
      (result, [placeholder, original]) => result.split(placeholder).join(original),
      value
    );
  }

  if (Array.isArray(value)) {
    return value.map((item) => rehydrateFromPlaceholders(item, placeholderMap));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        rehydrateFromPlaceholders(nestedValue, placeholderMap)
      ])
    );
  }

  return value;
}

export function containsPotentialPII(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const stripped = text.replace(PLACEHOLDER_REGEX, '');
  return [
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
    /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?){1,2}\d{4}\b/,
    /\b(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s<>"']+\b/i,
    /\b\d{1,6}\s+[A-Za-z0-9.\- ]+\s(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|way|parkway|pkwy)\b[^\n,]*/i
  ].some((pattern) => pattern.test(stripped));
}

export function redactPotentialPII(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  return text
    .replace(EMAIL_REGEX, '[REDACTED_EMAIL]')
    .replace(PHONE_REGEX, '[REDACTED_PHONE]')
    .replace(LINKEDIN_REGEX, '[REDACTED_LINKEDIN]')
    .replace(URL_REGEX, '[REDACTED_URL]')
    .replace(ADDRESS_REGEX, '[REDACTED_ADDRESS]');
}
