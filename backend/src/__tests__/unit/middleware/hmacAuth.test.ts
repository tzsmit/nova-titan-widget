/**
 * Unit Tests for HMAC Authentication Middleware
 */

import { HMACAuth } from '../../../middleware/hmacAuth';
import crypto from 'crypto';

describe('HMACAuth', () => {
  let hmacAuth: HMACAuth;
  const testSecret = 'test_secret_key';

  beforeEach(() => {
    hmacAuth = new HMACAuth({ secret: testSecret });
  });

  describe('generateSignature', () => {
    it('should generate consistent HMAC signatures', () => {
      const payload = 'test_payload';
      const signature1 = HMACAuth.generateSignature(payload, testSecret);
      const signature2 = HMACAuth.generateSignature(payload, testSecret);
      
      expect(signature1).toBe(signature2);
      expect(signature1).toHaveLength(64); // SHA256 produces 64 hex characters
    });

    it('should generate different signatures for different payloads', () => {
      const payload1 = 'test_payload_1';
      const payload2 = 'test_payload_2';
      
      const signature1 = HMACAuth.generateSignature(payload1, testSecret);
      const signature2 = HMACAuth.generateSignature(payload2, testSecret);
      
      expect(signature1).not.toBe(signature2);
    });

    it('should generate different signatures for different secrets', () => {
      const payload = 'test_payload';
      const secret1 = 'secret_1';
      const secret2 = 'secret_2';
      
      const signature1 = HMACAuth.generateSignature(payload, secret1);
      const signature2 = HMACAuth.generateSignature(payload, secret2);
      
      expect(signature1).not.toBe(signature2);
    });

    it('should support different hash algorithms', () => {
      const payload = 'test_payload';
      
      const sha256Sig = HMACAuth.generateSignature(payload, testSecret, 'sha256');
      const sha512Sig = HMACAuth.generateSignature(payload, testSecret, 'sha512');
      
      expect(sha256Sig).toHaveLength(64);
      expect(sha512Sig).toHaveLength(128);
      expect(sha256Sig).not.toBe(sha512Sig);
    });
  });

  describe('verifySignature', () => {
    it('should verify valid signatures', () => {
      const payload = 'test_payload';
      const signature = HMACAuth.generateSignature(payload, testSecret);
      
      const isValid = HMACAuth.verifySignature(payload, signature, testSecret);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid signatures', () => {
      const payload = 'test_payload';
      const invalidSignature = 'invalid_signature';
      
      const isValid = HMACAuth.verifySignature(payload, invalidSignature, testSecret);
      
      expect(isValid).toBe(false);
    });

    it('should reject signatures with tampered payload', () => {
      const originalPayload = 'original_payload';
      const tamperedPayload = 'tampered_payload';
      const signature = HMACAuth.generateSignature(originalPayload, testSecret);
      
      const isValid = HMACAuth.verifySignature(tamperedPayload, signature, testSecret);
      
      expect(isValid).toBe(false);
    });

    it('should use timing-safe comparison', () => {
      const payload = 'test_payload';
      const signature = HMACAuth.generateSignature(payload, testSecret);
      
      // Verify uses crypto.timingSafeEqual internally
      const spy = jest.spyOn(crypto, 'timingSafeEqual');
      HMACAuth.verifySignature(payload, signature, testSecret);
      
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('middleware', () => {
    it('should reject requests without HMAC signature', () => {
      const req = testUtils.createMockRequest({
        headers: {},
        body: { data: 'test' },
      });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = hmacAuth.verify();
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing HMAC signature',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests with expired timestamps', () => {
      const expiredTimestamp = Date.now() - (10 * 60 * 1000); // 10 minutes ago
      const payload = JSON.stringify({
        timestamp: expiredTimestamp,
        body: { data: 'test' },
      });
      const signature = HMACAuth.generateSignature(payload, testSecret);

      const req = testUtils.createMockRequest({
        headers: { 'x-hmac-signature': signature },
        body: { data: 'test' },
      });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = hmacAuth.verify();
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.stringContaining('timestamp'),
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should accept valid HMAC signatures with current timestamp', () => {
      const timestamp = Date.now();
      const body = { data: 'test' };
      const payload = JSON.stringify({ timestamp, body });
      const signature = HMACAuth.generateSignature(payload, testSecret);

      const req = testUtils.createMockRequest({
        headers: { 'x-hmac-signature': signature },
        body,
      });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = hmacAuth.verify();
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid signatures', () => {
      const timestamp = Date.now();
      const body = { data: 'test' };
      const invalidSignature = 'invalid_signature_here';

      const req = testUtils.createMockRequest({
        headers: { 'x-hmac-signature': invalidSignature },
        body,
      });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = hmacAuth.verify();
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid HMAC signature',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow custom header name configuration', () => {
      const customAuth = new HMACAuth({
        secret: testSecret,
        headerName: 'X-Custom-Signature',
      });

      const timestamp = Date.now();
      const body = { data: 'test' };
      const payload = JSON.stringify({ timestamp, body });
      const signature = HMACAuth.generateSignature(payload, testSecret);

      const req = testUtils.createMockRequest({
        headers: { 'x-custom-signature': signature },
        body,
      });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = customAuth.verify();
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should validate timestamp within configured window', () => {
      const customAuth = new HMACAuth({
        secret: testSecret,
        timestampWindow: 60000, // 1 minute
      });

      // Timestamp 59 seconds ago (within window)
      const timestamp = Date.now() - 59000;
      const body = { data: 'test' };
      const payload = JSON.stringify({ timestamp, body });
      const signature = HMACAuth.generateSignature(payload, testSecret);

      const req = testUtils.createMockRequest({
        headers: { 'x-hmac-signature': signature },
        body,
      });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = customAuth.verify();
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle empty payloads', () => {
      const payload = '';
      const signature = HMACAuth.generateSignature(payload, testSecret);
      const isValid = HMACAuth.verifySignature(payload, signature, testSecret);
      
      expect(isValid).toBe(true);
    });

    it('should handle special characters in payload', () => {
      const payload = '{"data": "test!@#$%^&*()"}';
      const signature = HMACAuth.generateSignature(payload, testSecret);
      const isValid = HMACAuth.verifySignature(payload, signature, testSecret);
      
      expect(isValid).toBe(true);
    });

    it('should handle unicode characters', () => {
      const payload = '{"data": "测试数据 🎉"}';
      const signature = HMACAuth.generateSignature(payload, testSecret);
      const isValid = HMACAuth.verifySignature(payload, signature, testSecret);
      
      expect(isValid).toBe(true);
    });

    it('should handle very long payloads', () => {
      const payload = 'a'.repeat(10000);
      const signature = HMACAuth.generateSignature(payload, testSecret);
      const isValid = HMACAuth.verifySignature(payload, signature, testSecret);
      
      expect(isValid).toBe(true);
    });
  });
});
