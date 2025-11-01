// src/utils/s3-presigned.ts
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;

export async function generatePresignedUrl(
    s3Key: string,
    expiresIn: number = 3600
): Promise<string> {
    try {
        const command = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: s3Key,
        });

        const signedUrl = await getSignedUrl(s3Client, command, {
            expiresIn,
        });

        return signedUrl;
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        throw new Error('Failed to generate presigned URL');
    }
}