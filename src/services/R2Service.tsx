import { getR2Bucket } from '@/lib/Cloudflare';
import type { R2ListOptions } from '@cloudflare/workers-types';

export async function listDirectoriesInR2(dirName?: string | null): Promise<string[]> {
  try {
    const prefix = dirName ? `${dirName}/` : '';
    const R2 = await getR2Bucket();

    if (!R2) {
      // サーバーコンポーネントから直接呼ばれることを想定し、より明確なエラーを投げる
      throw new Error(`R2 bucket binding not found. Please check your Cloudflare bindings configuration.`);
    }

    const listOptions: R2ListOptions = {
      prefix: prefix,
      delimiter: '/',
    };
    const listedObjects = await R2.list(listOptions);

    const directories = listedObjects.delimitedPrefixes.map(fullPath => {
      let dir = fullPath.substring(prefix.length);
      return dir.slice(0, -1);
    });

    return directories;
  } catch (error) {
    console.error('Error listing directories from R2 service:', error);
    // エラーを呼び出し元に伝播させる
    throw error;
  }
}
