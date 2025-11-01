// src/graphql/resolvers/photoResolvers.ts
import { PrismaClient } from '@prisma/client';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { generatePresignedUrl } from '../utils/s3-presigned';

const prisma = new PrismaClient();

export const photoResolvers = {
    Mutation: {
        addPhotoToWine: async (_: any, { wineId, url, s3Key, type = 'LABEL', caption, isPrimary = false }: any) => {
            // If setting as primary, unset other primary photos for this wine
            if (isPrimary) {
                await prisma.photo.updateMany({
                    where: { wineId, isPrimary: true },
                    data: { isPrimary: false },
                });
            }

            return await prisma.photo.create({
                data: {
                    wineId,
                    url,
                    s3Key,
                    type,
                    caption,
                    isPrimary,
                },
                include: { wine: true },
            });
        },

        updatePhoto: async (_: any, { id, caption, type }: any) => {
            const updateData: any = {};
            if (caption !== undefined) updateData.caption = caption;
            if (type !== undefined) updateData.type = type;

            return await prisma.photo.update({
                where: { id },
                data: updateData,
                include: { wine: true },
            });
        },

        deletePhoto: async (_: any, { id }: { id: string }, context: any) => {
            const { s3Client, S3_BUCKET_NAME } = context;

            const photo = await prisma.photo.findUnique({
                where: { id },
            });

            if (!photo) {
                throw new Error('Photo not found');
            }

            // Delete from S3 if s3Key exists
            if (photo.s3Key && s3Client && S3_BUCKET_NAME) {
                try {
                    await s3Client.send(
                        new DeleteObjectCommand({
                            Bucket: S3_BUCKET_NAME,
                            Key: photo.s3Key,
                        })
                    );
                } catch (error) {
                    console.error('Failed to delete from S3:', error);
                    // Continue with database deletion even if S3 delete fails
                }
            }

            return await prisma.photo.delete({
                where: { id },
                include: { wine: true },
            });
        },

        setPrimaryPhoto: async (_: any, { id }: { id: string }) => {
            const photo = await prisma.photo.findUnique({
                where: { id },
            });

            if (!photo) {
                throw new Error('Photo not found');
            }

            // Unset other primary photos for this wine
            await prisma.photo.updateMany({
                where: {
                    wineId: photo.wineId,
                    isPrimary: true,
                    id: { not: id },
                },
                data: { isPrimary: false },
            });

            // Set this photo as primary
            return await prisma.photo.update({
                where: { id },
                data: { isPrimary: true },
                include: { wine: true },
            });
        },
    },

    // Field Resolvers
    Photo: {
        url: async (parent: any) => {
            // If s3Key exists, generate a presigned URL
            if (parent.s3Key) {
                try {
                    // Generate URL valid for 1 hour
                    return await generatePresignedUrl(parent.s3Key, 3600);
                } catch (error) {
                    console.error('Failed to generate presigned URL:', error);
                    // Fall back to original URL if generation fails
                    return parent.url;
                }
            }
            // Return original URL if no s3Key
            return parent.url;
        },
    },
};