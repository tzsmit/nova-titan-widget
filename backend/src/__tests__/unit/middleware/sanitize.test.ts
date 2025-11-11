/**
 * Unit Tests for Input Sanitization Middleware
 */

import { Sanitizer, sanitize } from '../../../middleware/sanitize';

describe('Sanitizer', () => {
  describe('sanitizeString', () => {
    it('should strip HTML tags', () => {
      const input = '<script>alert("XSS")</script>Hello World';
      const output = Sanitizer.sanitizeString(input, { stripHtml: true });
      
      expect(output).not.toContain('<script>');
      expect(output).not.toContain('</script>');
    });

    it('should escape HTML entities', () => {
      const input = '<div>Test & "quotes"</div>';
      const output = Sanitizer.sanitizeString(input, { stripHtml: true });
      
      expect(output).toContain('&lt;');
      expect(output).toContain('&gt;');
      expect(output).toContain('&quot;');
    });

    it('should trim whitespace when configured', () => {
      const input = '  test  ';
      const output = Sanitizer.sanitizeString(input, { trimWhitespace: true });
      
      expect(output).toBe('test');
    });

    it('should enforce max length', () => {
      const input = 'a'.repeat(100);
      const output = Sanitizer.sanitizeString(input, { maxLength: 50 });
      
      expect(output).toHaveLength(50);
    });

    it('should preserve safe content', () => {
      const input = 'Hello World 123';
      const output = Sanitizer.sanitizeString(input);
      
      expect(output).toBe(input);
    });

    it('should remove null bytes', () => {
      const input = 'test\x00data';
      const output = Sanitizer.sanitizeString(input, { stripHtml: true });
      
      expect(output).not.toContain('\x00');
    });
  });

  describe('sanitizeObject', () => {
    it('should recursively sanitize nested objects', () => {
      const input = {
        name: '<script>alert("XSS")</script>',
        user: {
          email: '<img src=x onerror=alert(1)>',
          profile: {
            bio: '<b>Bold</b> text',
          },
        },
      };

      const output = Sanitizer.sanitizeObject(input, { stripHtml: true });

      expect(output.name).not.toContain('<script>');
      expect(output.user.email).not.toContain('<img');
      expect(output.user.profile.bio).not.toContain('<b>');
    });

    it('should sanitize arrays', () => {
      const input = {
        tags: ['<script>alert(1)</script>', 'safe tag', '<img src=x>'],
      };

      const output = Sanitizer.sanitizeObject(input, { stripHtml: true });

      expect(output.tags[0]).not.toContain('<script>');
      expect(output.tags[1]).toBe('safe tag');
      expect(output.tags[2]).not.toContain('<img');
    });

    it('should preserve non-string values', () => {
      const input = {
        name: 'test',
        age: 25,
        active: true,
        score: 99.5,
        data: null,
        missing: undefined,
      };

      const output = Sanitizer.sanitizeObject(input);

      expect(output.age).toBe(25);
      expect(output.active).toBe(true);
      expect(output.score).toBe(99.5);
      expect(output.data).toBeNull();
      expect(output.missing).toBeUndefined();
    });

    it('should handle circular references', () => {
      const input: any = { name: 'test' };
      input.self = input; // Circular reference

      expect(() => {
        Sanitizer.sanitizeObject(input);
      }).not.toThrow();
    });

    it('should handle empty objects and arrays', () => {
      const input = {
        emptyObj: {},
        emptyArr: [],
      };

      const output = Sanitizer.sanitizeObject(input);

      expect(output.emptyObj).toEqual({});
      expect(output.emptyArr).toEqual([]);
    });
  });

  describe('sanitizeQueryParams', () => {
    it('should sanitize query string parameters', () => {
      const input = {
        search: '<script>alert(1)</script>',
        page: '1',
        limit: '10',
      };

      const output = Sanitizer.sanitizeQueryParams(input);

      expect(output.search).not.toContain('<script>');
      expect(output.page).toBe('1');
      expect(output.limit).toBe('10');
    });

    it('should handle array query parameters', () => {
      const input = {
        tags: ['tag1', '<script>alert(1)</script>', 'tag3'],
      };

      const output = Sanitizer.sanitizeQueryParams(input);

      expect(Array.isArray(output.tags)).toBe(true);
      expect(output.tags[1]).not.toContain('<script>');
    });

    it('should handle nested query parameters', () => {
      const input = {
        filter: {
          name: '<img src=x>',
          status: 'active',
        },
      };

      const output = Sanitizer.sanitizeQueryParams(input);

      expect(output.filter.name).not.toContain('<img');
      expect(output.filter.status).toBe('active');
    });
  });

  describe('validation helpers', () => {
    describe('isValidEmail', () => {
      it('should validate correct email addresses', () => {
        expect(Sanitizer.isValidEmail('test@example.com')).toBe(true);
        expect(Sanitizer.isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
      });

      it('should reject invalid email addresses', () => {
        expect(Sanitizer.isValidEmail('invalid')).toBe(false);
        expect(Sanitizer.isValidEmail('test@')).toBe(false);
        expect(Sanitizer.isValidEmail('@example.com')).toBe(false);
        expect(Sanitizer.isValidEmail('<script>@example.com')).toBe(false);
      });
    });

    describe('isValidURL', () => {
      it('should validate correct URLs', () => {
        expect(Sanitizer.isValidURL('https://example.com')).toBe(true);
        expect(Sanitizer.isValidURL('http://subdomain.example.com/path?query=1')).toBe(true);
      });

      it('should reject invalid URLs', () => {
        expect(Sanitizer.isValidURL('not a url')).toBe(false);
        expect(Sanitizer.isValidURL('javascript:alert(1)')).toBe(false);
        expect(Sanitizer.isValidURL('<script>alert(1)</script>')).toBe(false);
      });
    });

    describe('isAlphanumeric', () => {
      it('should validate alphanumeric strings', () => {
        expect(Sanitizer.isAlphanumeric('abc123')).toBe(true);
        expect(Sanitizer.isAlphanumeric('TEST123')).toBe(true);
      });

      it('should reject non-alphanumeric strings', () => {
        expect(Sanitizer.isAlphanumeric('test@123')).toBe(false);
        expect(Sanitizer.isAlphanumeric('test 123')).toBe(false);
        expect(Sanitizer.isAlphanumeric('<script>')).toBe(false);
      });
    });
  });

  describe('middleware', () => {
    it('should sanitize request body', () => {
      const req = testUtils.createMockRequest({
        body: {
          name: '<script>alert(1)</script>',
          email: 'test@example.com',
        },
      });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = sanitize({ stripHtml: true });
      middleware(req, res, next);

      expect(req.body.name).not.toContain('<script>');
      expect(req.body.email).toBe('test@example.com');
      expect(next).toHaveBeenCalled();
    });

    it('should sanitize query parameters', () => {
      const req = testUtils.createMockRequest({
        query: {
          search: '<img src=x onerror=alert(1)>',
          page: '1',
        },
      });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = sanitize({ stripHtml: true });
      middleware(req, res, next);

      expect(req.query.search).not.toContain('<img');
      expect(req.query.page).toBe('1');
      expect(next).toHaveBeenCalled();
    });

    it('should handle requests with no body or query', () => {
      const req = testUtils.createMockRequest({});
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = sanitize();
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should apply custom sanitization options', () => {
      const req = testUtils.createMockRequest({
        body: {
          name: '  test  ',
          description: 'a'.repeat(200),
        },
      });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = sanitize({
        trimWhitespace: true,
        maxLength: 100,
      });
      middleware(req, res, next);

      expect(req.body.name).toBe('test');
      expect(req.body.description).toHaveLength(100);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('XSS prevention', () => {
    const xssPayloads = [
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(1)>',
      '<svg onload=alert(1)>',
      'javascript:alert(1)',
      '<iframe src="javascript:alert(1)">',
      '<body onload=alert(1)>',
      '<input onfocus=alert(1) autofocus>',
      '<select onfocus=alert(1) autofocus>',
      '<textarea onfocus=alert(1) autofocus>',
      '<marquee onstart=alert(1)>',
    ];

    xssPayloads.forEach((payload) => {
      it(`should neutralize XSS payload: ${payload.substring(0, 50)}...`, () => {
        const output = Sanitizer.sanitizeString(payload, { stripHtml: true });
        
        expect(output.toLowerCase()).not.toContain('<script');
        expect(output.toLowerCase()).not.toContain('javascript:');
        expect(output.toLowerCase()).not.toContain('onerror=');
        expect(output.toLowerCase()).not.toContain('onload=');
      });
    });
  });

  describe('SQL injection prevention', () => {
    const sqlPayloads = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin'--",
      "' UNION SELECT * FROM users--",
      "1; DELETE FROM users WHERE 1=1",
    ];

    sqlPayloads.forEach((payload) => {
      it(`should sanitize SQL injection payload: ${payload}`, () => {
        const output = Sanitizer.sanitizeString(payload, { stripHtml: true });
        
        // Should escape dangerous characters
        expect(output).not.toBe(payload);
      });
    });
  });

  describe('performance', () => {
    it('should handle large objects efficiently', () => {
      const largeObject: any = {};
      for (let i = 0; i < 1000; i++) {
        largeObject[`key${i}`] = `<script>value${i}</script>`;
      }

      const startTime = Date.now();
      const output = Sanitizer.sanitizeObject(largeObject, { stripHtml: true });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
      expect(Object.keys(output)).toHaveLength(1000);
    });

    it('should handle deeply nested objects', () => {
      let nested: any = { value: '<script>alert(1)</script>' };
      for (let i = 0; i < 10; i++) {
        nested = { child: nested };
      }

      const output = Sanitizer.sanitizeObject(nested, { stripHtml: true });
      
      // Navigate to the deepest level
      let current = output;
      for (let i = 0; i < 10; i++) {
        current = current.child;
      }
      
      expect(current.value).not.toContain('<script>');
    });
  });
});
