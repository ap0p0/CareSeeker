import {
  calculateAge,
  normalizeUsPhone,
  parseAddress,
  parseDateOfBirth,
  parseGender,
  parseName,
  parsePhone,
} from './personal-info.validation';

const TODAY = new Date(Date.UTC(2026, 6, 24)); // 2026-07-24

describe('personal-info.validation', () => {
  describe('parseName', () => {
    it('trims and accepts a valid name', () => {
      const errors: string[] = [];
      expect(parseName('  Jane ', 'name', errors)).toBe('Jane');
      expect(errors).toEqual([]);
    });

    it('rejects empty / non-string values', () => {
      const errors: string[] = [];
      expect(parseName('   ', 'name', errors)).toBeNull();
      expect(parseName(42, 'surname', errors)).toBeNull();
      expect(errors).toEqual(['name is required', 'surname is required']);
    });

    it('rejects names longer than 100 characters', () => {
      const errors: string[] = [];
      expect(parseName('a'.repeat(101), 'name', errors)).toBeNull();
      expect(errors[0]).toMatch(/at most 100/);
    });
  });

  describe('calculateAge / parseDateOfBirth', () => {
    it('computes full years only', () => {
      expect(calculateAge(new Date(Date.UTC(2008, 6, 24)), TODAY)).toBe(18);
      expect(calculateAge(new Date(Date.UTC(2008, 6, 25)), TODAY)).toBe(17);
    });

    it('accepts someone turning 18 today', () => {
      const errors: string[] = [];
      const result = parseDateOfBirth('2008-07-24', errors, TODAY);
      expect(result?.toISOString()).toBe('2008-07-24T00:00:00.000Z');
      expect(errors).toEqual([]);
    });

    it('rejects someone who is 17', () => {
      const errors: string[] = [];
      expect(parseDateOfBirth('2008-07-25', errors, TODAY)).toBeNull();
      expect(errors).toEqual([
        'dateOfBirth must be at least 18 years before today',
      ]);
    });

    it('rejects malformed and impossible dates', () => {
      const errors: string[] = [];
      expect(parseDateOfBirth('24/07/1990', errors, TODAY)).toBeNull();
      expect(parseDateOfBirth('1990-02-30', errors, TODAY)).toBeNull();
      expect(parseDateOfBirth('', errors, TODAY)).toBeNull();
      expect(errors).toEqual([
        'dateOfBirth must be a date in YYYY-MM-DD format',
        'dateOfBirth must be a valid calendar date',
        'dateOfBirth is required',
      ]);
    });

    it('rejects implausibly old dates', () => {
      const errors: string[] = [];
      expect(parseDateOfBirth('1890-01-01', errors, TODAY)).toBeNull();
      expect(errors).toEqual(['dateOfBirth is not a plausible date of birth']);
    });
  });

  describe('parseGender', () => {
    it('is optional and normalizes to the enum', () => {
      const errors: string[] = [];
      expect(parseGender(undefined, errors)).toBeNull();
      expect(parseGender('', errors)).toBeNull();
      expect(parseGender('non_binary', errors)).toBe('NON_BINARY');
      expect(parseGender('Female', errors)).toBe('FEMALE');
      expect(errors).toEqual([]);
    });

    it('rejects unknown values', () => {
      const errors: string[] = [];
      expect(parseGender('other', errors)).toBeNull();
      expect(errors[0]).toMatch(/gender must be one of/);
    });
  });

  describe('parsePhone', () => {
    it('normalizes US numbers to E.164', () => {
      expect(normalizeUsPhone('+1 (555) 123-4567')).toBe('+15551234567');
      expect(normalizeUsPhone('555.123.4567')).toBe('+15551234567');
      expect(normalizeUsPhone('1-555-123-4567')).toBe('+15551234567');
      const errors: string[] = [];
      expect(parsePhone(' (555) 123 4567 ', errors)).toBe('+15551234567');
      expect(errors).toEqual([]);
    });

    it('rejects non-US, too short and alphabetic input', () => {
      const errors: string[] = [];
      expect(parsePhone('+44 20 7946 0958', errors)).toBeNull();
      expect(parsePhone('12345', errors)).toBeNull();
      expect(parsePhone('055 123 4567', errors)).toBeNull(); // area code cannot start with 0
      expect(parsePhone('call-me', errors)).toBeNull();
      expect(parsePhone(undefined, errors)).toBeNull();
      expect(errors).toHaveLength(5);
      expect(errors[4]).toBe('phone is required');
    });
  });

  describe('parseAddress', () => {
    const valid = {
      addressLine1: '123 Main St',
      city: 'Austin',
      state: 'tx',
      postalCode: '78701',
    };

    it('returns a structured US address with an upper-cased state code', () => {
      const errors: string[] = [];
      expect(parseAddress(valid, errors)).toEqual({ ...valid, state: 'TX' });
      expect(
        parseAddress({ ...valid, postalCode: '78701-1234' }, errors),
      ).toEqual({ ...valid, state: 'TX', postalCode: '78701-1234' });
      expect(errors).toEqual([]);
    });

    it('rejects unknown states and non-ZIP postal codes', () => {
      const errors: string[] = [];
      expect(parseAddress({ ...valid, state: 'Texas' }, errors)).toBeNull();
      expect(
        parseAddress({ ...valid, postalCode: 'SW1A 1AA' }, errors),
      ).toBeNull();
      expect(errors).toEqual([
        'state must be a valid US state code (e.g. TX)',
        'postalCode must be a US ZIP code (12345 or 12345-6789)',
      ]);
    });

    it('lists every missing required part', () => {
      const errors: string[] = [];
      expect(parseAddress({}, errors)).toBeNull();
      expect(errors).toEqual([
        'addressLine1 is required',
        'city is required',
        'state is required',
        'postalCode is required',
      ]);
    });
  });
});
