import { MeiliSearch } from 'meilisearch';

const host = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const apiKey = process.env.MEILISEARCH_MASTER_KEY || 'nexus_master_key';

export const meiliClient = new MeiliSearch({
  host,
  apiKey,
});

export const studentsIndex = meiliClient.index('students');
export const resourcesIndex = meiliClient.index('resources');

let meilisearchHealthy = true;
export const isMeilisearchAvailable = () => meilisearchHealthy;

/**
 * Initialize Meilisearch and configure indexes if necessary
 */
export async function initializeMeilisearch() {
  try {
    await meiliClient.health();
    meilisearchHealthy = true;
    console.log('✅ Meilisearch healthy');
    await configureMeilisearchIndexes();
  } catch (err) {
    meilisearchHealthy = false;
    console.warn('⚠️ Meilisearch unavailable — using MongoDB fallback');
  }
}

/**
 * Idempotent index configuration with lazy check
 */
export async function configureMeilisearchIndexes() {
  try {
    // 1. Lazy configuration check
    let isConfigured = false;
    try {
      const currentSettings = await studentsIndex.getSettings();
      isConfigured = !!(
        currentSettings.searchableAttributes?.includes('skills') &&
        currentSettings.filterableAttributes?.includes('campus') &&
        currentSettings.typoTolerance?.enabled === true
      );
    } catch (e) {
      console.log('Index not found, proceeding with creation...');
    }

    if (isConfigured) {
      console.log('✅ Meilisearch indexes already configured');
      return;
    }

    console.log('🔧 Configuring Meilisearch indexes...');

    // 2. Configure Students Index
    await studentsIndex.updateSettings({
      searchableAttributes: [
        'name',
        'skills',
        'wantToLearn',
        'specialization',
        'department'
      ],
      filterableAttributes: [
        'campus',
        'rankTier',
        'nexusCrossEnabled',
        'moderationStatus',
        'onboardingStatus'
      ],
      sortableAttributes: [
        'karma',
        'reputationScore',
        'createdAt'
      ],
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: {
          oneTypo: 4,
          twoTypos: 8
        }
      }
    });

    // 3. Configure Resources Index
    await resourcesIndex.updateSettings({
      searchableAttributes: [
        'title',
        'subject',
        'courseCode',
        'description',
        'tags',
        'department'
      ],
      filterableAttributes: [
        'campus',
        'fileType',
        'subject',
        'visibility',
        'verificationStatus',
        'nexusCrossEnabled'
      ],
      sortableAttributes: [
        'downloads',
        'ratingsAverage',
        'karmaCost',
        'createdAt'
      ],
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: {
          oneTypo: 3,
          twoTypos: 7
        }
      }
    });

    console.log('✅ Meilisearch indexes configured');
  } catch (error) {
    console.warn('Failed to configure Meilisearch indexes:', error);
  }
}
