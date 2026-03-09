import { describe, it, expect } from 'vitest';
import {
  sanitizeTextForLLM,
  rehydrateFromPlaceholders,
  containsPotentialPII,
  redactPotentialPII
} from '../utils/privacySanitizer';

describe('privacySanitizer', () => {
  it('masks direct identifiers with deterministic placeholders', () => {
    const input = `John Doe
john@example.com
john@example.com
Phone: 555-123-9876
LinkedIn: https://linkedin.com/in/johndoe`;

    const result = sanitizeTextForLLM(input);

    expect(result.sanitizedText).toContain('[EMAIL_1]');
    expect(result.sanitizedText).toContain('[PHONE_1]');
    expect(result.sanitizedText).toContain('[URL_1]');
    expect(result.sanitizedText.match(/\[EMAIL_1\]/g)?.length).toBe(2);
    expect(result.placeholderMap['[EMAIL_1]']).toBe('john@example.com');
    expect(result.stats.emailsMasked).toBe(1);
  });

  it('rehydrates placeholders back to original values', () => {
    const value = {
      name: '[CANDIDATE_NAME]',
      highlights: ['Reach [EMAIL_1] for portfolio details.']
    };
    const placeholderMap = {
      '[CANDIDATE_NAME]': 'Jane Doe',
      '[EMAIL_1]': 'jane@example.com'
    };

    const rehydrated = rehydrateFromPlaceholders(value, placeholderMap);
    expect(rehydrated.name).toBe('Jane Doe');
    expect(rehydrated.highlights[0]).toContain('jane@example.com');
  });

  it('detects and redacts potential PII', () => {
    const raw = 'Email me at hello@example.com and call +1 212-555-4444.';
    expect(containsPotentialPII(raw)).toBe(true);

    const redacted = redactPotentialPII(raw);
    expect(redacted).not.toContain('hello@example.com');
    expect(redacted).not.toContain('212-555-4444');
    expect(redacted).toContain('[REDACTED_EMAIL]');
    expect(redacted).toContain('[REDACTED_PHONE]');
  });
});
