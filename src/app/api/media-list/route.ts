import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/Auth';
import { getR2Bucket } from '@/lib/Cloudflare';
import type { R2Object, R2ListOptions } from '@cloudflare/workers-types';

// R2Fileインターフェースはそのまま利用
interface R2File {
  key: string;
  url: string;
  lastModified?: Date;
  size?: number;
  eTag?: string; // R2Objectのetagは大文字始まりのEtagになる点に注意
}

const R2_PUBLIC_URL_BASE = process.env.R2_PUBLIC_URL_BASE;
const R2_BUCKET_NAME_FOR_URL = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT_FOR_URL = process.env.R2_ENDPOINT; // 公開URLのホスト名部がENDPOINTから導出できる場合

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    let prefix = siteId ? `images/${siteId}/` : 'common/';

    const R2 = await getR2Bucket();

    if (!R2) {
      console.error(`R2 bucket binding not found.`);
      return NextResponse.json({ error: `R2 bucket binding not found.` }, { status: 500 });
    }

    const listOptions: R2ListOptions = {
      prefix: prefix,
      // 必要に応じて limit, cursor などのオプションを追加
    };

    const listedObjects = await R2.list(listOptions);

    if (!listedObjects.objects || listedObjects.objects.length === 0) {
      return NextResponse.json({ success: true, files: [] });
    }

    const files: R2File[] = listedObjects.objects
      .filter(obj => obj.key !== prefix && obj.size > 0) // ディレクトリ自身や空ファイルを除外
      .map((obj: R2Object) => {
        const fileKey = obj.key;

        let publicFileUrl = '';
        if (R2_PUBLIC_URL_BASE) {
            publicFileUrl = `${R2_PUBLIC_URL_BASE.endsWith('/') ? R2_PUBLIC_URL_BASE : R2_PUBLIC_URL_BASE + '/'}${fileKey}`;
        } else if (R2_BUCKET_NAME_FOR_URL && R2_ENDPOINT_FOR_URL) {
            const endpointHostname = new URL(R2_ENDPOINT_FOR_URL).hostname;
            publicFileUrl = `https://${R2_BUCKET_NAME_FOR_URL}.${endpointHostname}/${fileKey}`;
        } else {
            console.warn(`Public URL for ${fileKey} could not be determined. R2_PUBLIC_URL_BASE or R2_BUCKET_NAME_FOR_URL/R2_ENDPOINT_FOR_URL might be missing.`);
            publicFileUrl = fileKey;
        }

        return {
          key: fileKey,
          url: publicFileUrl,
          lastModified: obj.uploaded, // R2Objectでは uploaded
          size: obj.size,
          eTag: obj.httpEtag, // R2Objectでは httpEtag
        };
      })
      .sort((a, b) => (b.lastModified?.getTime() || 0) - (a.lastModified?.getTime() || 0));

    // cursor をオプショナルに扱い、存在する場合のみレスポンスに含める
    const responsePayload: { success: boolean; files: R2File[]; truncated: boolean; cursor?: string } = {
      success: true,
      files,
      truncated: listedObjects.truncated,
    };
    if (listedObjects.truncated && listedObjects.cursor) {
      responsePayload.cursor = listedObjects.cursor;
    }
    return NextResponse.json(responsePayload);

  } catch (error: any) {
    console.error('Error listing files from R2:', error);
    return NextResponse.json({ error: error.message || 'Failed to list files.' }, { status: 500 });
  }
}
