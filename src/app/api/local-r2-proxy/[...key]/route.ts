import { NextRequest, NextResponse } from 'next/server';
import { getR2Bucket } from '@/lib/Cloudflare';

export async function GET(request: NextRequest, { params }: { params: { key: string[] } }) {
  if (process.env.NODE_ENV !== 'development') {
    // 本番環境ではこのプロキシは動作させない
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const objectKey = params.key.join('/');
  if (!objectKey) {
    return NextResponse.json({ error: 'Object key is required' }, { status: 400 });
  }

  try {
    const R2 = await getR2Bucket();

    if (!R2) {
      console.error(`R2 bucket binding not found for local proxy.`);
      return NextResponse.json({ error: `R2 bucket binding not found.` }, { status: 500 });
    }

    const object = await R2.get(objectKey);

    if (object === null) {
      return NextResponse.json({ error: 'Object not found' }, { status: 404 });
    }

    const headers = new Headers();
    // R2ObjectBody には httpMetadata が含まれるので、それをヘッダーに設定
    if (object.httpMetadata?.contentType) {
      headers.set('Content-Type', object.httpMetadata.contentType);
    }
    if (object.httpMetadata?.contentEncoding) {
      headers.set('Content-Encoding', object.httpMetadata.contentEncoding);
    }
    headers.set('Cache-Control', 'no-cache'); // ローカルプロキシなのでキャッシュしない

    // R2ObjectBody の body は ReadableStream なのでそのままレスポンスとして返す
    return new Response(object.body as any, { headers });
  } catch (error: any) {
    console.error(`Error fetching object "${objectKey}" from local R2:`, error);
    return NextResponse.json({ error: error.message || `Failed to fetch object.` }, { status: 500 });
  }
}
