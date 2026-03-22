/**
 * SEARCH SERVICE FALLBACK TESTS
 * Tests Promise.race timeout and MongoDB fallback behavior
 */

import { SearchService } from '../../src/modules/search/search.service';
import { studentsIndex } from '../../src/lib/meilisearch';
import { StudentModel } from '@edusync/db';

jest.mock('../../src/lib/meilisearch', () => ({
  studentsIndex: {
    search: jest.fn()
  }
}));

jest.mock('@edusync/db', () => ({
  StudentModel: {
    find: jest.fn(),
    countDocuments: jest.fn()
  }
}));

describe('SearchService Fallback (PHASE 9 HARDENED)', () => {
  const requester = {
    uid: 'req-1',
    campusId: 'IIT_JAMMU',
    partnerCampuses: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to mock chainable Mongoose calls
  const mockMongoChain = (results: any) => {
    const chain = {
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(results)
    };
    (StudentModel.find as any).mockReturnValue(chain);
    return chain;
  };

  test('1-second timeout triggers fallback', async () => {
    // Mock Meilisearch to hang for 2 seconds
    (studentsIndex.search as any).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ hits: [], totalHits: 0 }), 2000)
        )
    );

    // Mock MongoDB
    mockMongoChain([{ firebaseUid: 'h1', name: 'Fallback Student', karma: 100 }]);
    (StudentModel.countDocuments as any).mockResolvedValue(1);

    const result = await SearchService.search('Python', {}, requester);

    // Should fallback to MongoDB before 1.5 seconds (allow buffer)
    expect(result.latencyMs).toBeLessThan(1500);
    expect(result.provider).toBe('mongodb');
    expect(result.hits[0].name).toBe('Fallback Student');
  });

  test('Meilisearch error triggers fallback', async () => {
    (studentsIndex.search as any).mockRejectedValue(new Error('Connection refused'));

    mockMongoChain([{ firebaseUid: 'h2', name: 'Error Student', karma: 200 }]);
    (StudentModel.countDocuments as any).mockResolvedValue(1);

    const result = await SearchService.search('Python', {}, requester);

    expect(result.provider).toBe('mongodb');
    expect(result.hits[0].name).toBe('Error Student');
  });

  test('Both fail returns empty safely', async () => {
    (studentsIndex.search as any).mockRejectedValue(new Error('fail-meili'));
    (StudentModel.find as any).mockReturnValue({
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockRejectedValue(new Error('fail-mongo'))
    });

    const result = await SearchService.search('Python', {}, requester);
    expect(result.hits).toHaveLength(0);
    expect(result.provider).toBe('mongodb');
    expect(result.fallbackReason).toContain('fail-mongo');
  });

  test('Same response shape for both providers', async () => {
    // 1. Meili Success
    (studentsIndex.search as any).mockResolvedValue({ hits: [{ firebaseUid: 'meili', name: 'Meili User' }], totalHits: 1 });
    const meiliRes = await SearchService.search('Python', {}, requester);

    // 2. Mongo Success (via Meili Error)
    (studentsIndex.search as any).mockRejectedValue(new Error('fail'));
    mockMongoChain([{ firebaseUid: 'mongo', name: 'Mongo User' }]);
    (StudentModel.countDocuments as any).mockResolvedValue(1);
    const mongoRes = await SearchService.search('Python', {}, requester);

    expect(meiliRes).toHaveProperty('hits');
    expect(meiliRes).toHaveProperty('provider');
    expect(meiliRes).toHaveProperty('latencyMs');

    expect(mongoRes).toHaveProperty('hits');
    expect(mongoRes).toHaveProperty('provider');
    expect(mongoRes).toHaveProperty('latencyMs');
  });
});
