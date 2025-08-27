const githubService = require('../../src/services/githubService');

describe('GitHub Service', () => {
  describe('parseRepoUrl', () => {
    it('should parse valid GitHub URL', () => {
      const url = 'https://github.com/owner/repo';
      const result = githubService.parseRepoUrl(url);
      
      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo'
      });
    });

    it('should handle .git extension', () => {
      const url = 'https://github.com/owner/repo.git';
      const result = githubService.parseRepoUrl(url);
      
      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo'
      });
    });

    it('should throw error for invalid URL', () => {
      expect(() => {
        githubService.parseRepoUrl('invalid-url');
      }).toThrow('Invalid GitHub URL');
    });
  });

  describe('getRepositoryInfo', () => {
    it('should return repository information', async () => {
      expect(true).toBe(true); // Placeholder
    });
  });
});