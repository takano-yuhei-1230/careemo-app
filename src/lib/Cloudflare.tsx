import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

export function getD1Database(): D1Database {
  try {
    const db = (getCloudflareContext().env as any).DB;
    return db as D1Database;
  } catch (e) {
    console.error('Error fetching D1Database:', e);
    throw e;
  }
}

export function getR2Bucket(): R2Bucket {
  try {
    const R2_BINDING_NAME = process.env.R2_BINDING_NAME || 'R2_BUCKET';
    const R2 = (getCloudflareContext().env as any)[R2_BINDING_NAME] as R2Bucket;

    if (!R2) {
      throw new Error(
        `R2 bucket binding "${R2_BINDING_NAME}" not found. Please check your Cloudflare bindings configuration.`,
      );
    }

    return R2;
  } catch (e) {
    console.error('Error fetching R2Bucket:', e);
    throw e;
  }
}
