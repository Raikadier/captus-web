import { describe, it, expect } from 'vitest';
import apiClient from '../client';

describe('apiClient', () => {
  it('exports an axios instance', () => {
    expect(apiClient).toBeDefined();
    expect(typeof apiClient).toBe('function');
  });

  it('has default config properties', () => {
    expect(apiClient.defaults).toBeDefined();
    expect(apiClient.defaults.timeout).toBe(30000);
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });
});
