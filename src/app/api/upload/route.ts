import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/Auth';
import { getR2Bucket } from '@/lib/Cloudflare';

const R2_PUBLIC_URL_BASE = process.env.R2_PUBLIC_URL_BASE;
const R2_BUCKET_NAME_FOR_URL = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT_FOR_URL = process.env.R2_ENDPOINT;

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const siteId = formData.get('siteId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'File is required.' }, { status: 400 });
    }

    const pathPrefix = siteId ? `images/${siteId}/` : 'common/';

    const fileBuffer = await file.arrayBuffer();
    const uniqueFileName = `${file.name}`;
    const r2Key = `${pathPrefix}${uniqueFileName}`;

    const R2 = await getR2Bucket();

    if (!R2) {
      console.error(`R2 bucket binding not found for upload.`);
      return NextResponse.json({ error: `R2 bucket binding not found.` }, { status: 500 });
    }

    const uploadedObject = await R2.put(r2Key, fileBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    if (!uploadedObject || uploadedObject.key !== r2Key) {
      console.error('R2 put operation did not return the expected object or key mismatch.');
      throw new Error('Failed to confirm file upload to R2.');
    }

    let publicFileUrl = '';
    if (R2_PUBLIC_URL_BASE) {
      publicFileUrl = `${R2_PUBLIC_URL_BASE.endsWith('/') ? R2_PUBLIC_URL_BASE : R2_PUBLIC_URL_BASE + '/'}${r2Key}`;
    } else if (R2_BUCKET_NAME_FOR_URL && R2_ENDPOINT_FOR_URL) {
      const endpointHostname = new URL(R2_ENDPOINT_FOR_URL).hostname;
      publicFileUrl = `https://${R2_BUCKET_NAME_FOR_URL}.${endpointHostname}/${r2Key}`;
    } else {
      console.warn(
        `Public URL for ${r2Key} could not be determined during upload. R2_PUBLIC_URL_BASE or R2_BUCKET_NAME_FOR_URL/R2_ENDPOINT_FOR_URL might be missing.`,
      );
      publicFileUrl = r2Key;
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      url: publicFileUrl,
      r2Key: uploadedObject.key,
    });
  } catch (error: any) {
    console.error('Error uploading file to R2:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload file.' }, { status: 500 });
  }
}
