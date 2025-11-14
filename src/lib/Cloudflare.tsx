import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

export async function getD1Database(): Promise<D1Database> {
  try {
    const db = (await getCloudflareContext({ async: true })).env.DB;
    return db as D1Database;
  } catch (e) {
    console.error('Error fetching D1Database:', e);
    throw e;
  }
}

export async function getR2Bucket(): Promise<R2Bucket> {
  try {
    const R2_BINDING_NAME = process.env.R2_BINDING_NAME || 'R2_BUCKET';
    const context = await getCloudflareContext({ async: true });
    const R2 = context.env[R2_BINDING_NAME as keyof typeof context.env] as R2Bucket;

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
