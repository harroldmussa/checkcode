const {
  validateRepoUrl,
  parseGitHubUrl,
  formatFileSize,
  formatDuration,
  calculatePercentage
} = require('../../src/utils/helpers');

describe('Helpers', () => {
  describe('validateRepoUrl', () => {
    it('should validate correct GitHub URLs', () => {
      expect(validateRepoUrl('https://github.com/owner/repo')).toBe(true);
      expect(validateRepoUrl('https://github.com/owner/repo/')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateRepoUrl('http://github.com/owner/repo')).toBe(false);
      expect(validateRepoUrl('https://gitlab.com/owner/repo')).toBe(false);
      expect(validateRepoUrl('')).toBe(false);
      expect(validateRepoUrl(null)).toBe(false);
    });
  });

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  describe('formatDuration', () => {
    it('should format durations correctly', () => {
      expect(formatDuration(1000)).toBe('1s');
      expect(formatDuration(60000)).toBe('1m 0s');
      expect(formatDuration(3661000)).toBe('1h 1m 1s');
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate percentages correctly', () => {
      expect(calculatePercentage(25, 100)).toBe(25);
      expect(calculatePercentage(1, 3)).toBe(33.3);
      expect(calculatePercentage(0, 100)).toBe(0);
      expect(calculatePercentage(10, 0)).toBe(0);
    });
  });
});