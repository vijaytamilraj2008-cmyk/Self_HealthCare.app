import { api } from './api';
import { MedicalDocument, TimelineEvent } from '../types';

const MIGRATION_PREFIX = 'ahs_backend_migration_v3_';
const LEGACY_DOCS_KEY = 'ahs_documents_v1';
const LEGACY_TIMELINE_KEY = 'ahs_timeline_v1';
const LEGACY_SHARE_KEY = 'ahs_share_tokens_v1';

class DataMigrationService {
  async migrateForUser(userId: string): Promise<void> {
    if (typeof localStorage === 'undefined' || !userId) return;
    const marker = `${MIGRATION_PREFIX}${userId}`;
    if (localStorage.getItem(marker) === 'done') return;

    try {
      const rawDocs = localStorage.getItem(LEGACY_DOCS_KEY);
      const rawTimeline = localStorage.getItem(LEGACY_TIMELINE_KEY);
      const documents: MedicalDocument[] = rawDocs ? JSON.parse(rawDocs) : [];
      const timeline: TimelineEvent[] = rawTimeline ? JSON.parse(rawTimeline) : [];

      // Migrate only records explicitly owned by the authenticated user.
      // This prevents old demo/seed records from leaking into real accounts.
      for (const doc of documents.filter(d => d.userId === userId)) {
        await api.post('/documents', doc);
      }
      for (const event of timeline.filter(e => e.userId === userId)) {
        await api.post('/timeline', event);
      }

      localStorage.removeItem(LEGACY_DOCS_KEY);
      localStorage.removeItem(LEGACY_TIMELINE_KEY);
      localStorage.removeItem(LEGACY_SHARE_KEY);
      localStorage.setItem(marker, 'done');
    } catch (error) {
      // Keep legacy records for retry if any server request fails.
      console.warn('Backend healthcare-data migration will retry on the next session.', error);
    }
  }
}

export const dataMigrationService = new DataMigrationService();
