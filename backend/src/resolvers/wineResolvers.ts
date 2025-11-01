// src/graphql/resolvers/wineResolvers.ts
import { PrismaClient } from '@prisma/client';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const prisma = new PrismaClient();

export const wineResolvers = {
    Query: {
        wines: async (_: any, { filter, skip = 0, take = 100 }: any) => {
            const where: any = {};

            if (filter) {
                if (filter.type) where.type = filter.type;
                if (filter.country) where.country = { contains: filter.country, mode: 'insensitive' };
                if (filter.region) where.region = { contains: filter.region, mode: 'insensitive' };
                if (filter.status) where.status = filter.status;
                if (filter.wineryId) where.wineryId = filter.wineryId;
                if (filter.varietalId) where.varietalId = filter.varietalId;
                if (filter.minVintage || filter.maxVintage) {
                    where.vintage = {};
                    if (filter.minVintage) where.vintage.gte = filter.minVintage;
                    if (filter.maxVintage) where.vintage.lte = filter.maxVintage;
                }
                if (filter.search) {
                    where.OR = [
                        { name: { contains: filter.search, mode: 'insensitive' } },
                        { winery: { name: { contains: filter.search, mode: 'insensitive' } } },
                        { varietal: { name: { contains: filter.search, mode: 'insensitive' } } },
                    ];
                }
            }

            return await prisma.wine.findMany({
                where,
                skip,
                take,
                include: {
                    winery: true,
                    varietal: true,
                    tags: true,
                    photos: true
                },
                orderBy: { createdAt: 'desc' },
            });
        },

        wine: async (_: any, { id }: { id: string }) => {
            return await prisma.wine.findUnique({
                where: { id },
                include: {
                    winery: true,
                    varietal: true,
                    tags: true,
                    photos: true
                },
            });
        },

        wineStats: async () => {
            const wines = await prisma.wine.findMany({
                where: { status: { not: 'CONSUMED' } },
            });

            const totalBottles = wines.reduce((sum, wine) => sum + wine.quantity, 0);
            const totalValue = wines.reduce((sum, wine) => {
                const price = wine.currentValue || wine.purchasePrice || 0;
                return sum + (Number(price) * wine.quantity);
            }, 0);

            const byType = await prisma.wine.groupBy({
                by: ['type'],
                _count: { id: true },
                where: { status: { not: 'CONSUMED' } },
            });

            const byCountry = await prisma.wine.groupBy({
                by: ['country'],
                _count: { id: true },
                where: {
                    status: { not: 'CONSUMED' },
                    country: { not: null },
                },
            });

            const currentYear = new Date().getFullYear();
            const readyToDrink = await prisma.wine.count({
                where: {
                    status: { not: 'CONSUMED' },
                    OR: [
                        { drinkFrom: { lte: currentYear } },
                        { drinkFrom: null },
                    ],
                },
            });

            return {
                totalBottles,
                totalValue,
                byType: byType.map(t => ({ type: t.type, count: t._count.id })),
                byCountry: byCountry.map(c => ({ country: c.country, count: c._count.id })),
                readyToDrink,
            };
        },
    },

    Mutation: {
        createWine: async (_: any, { input }: any) => {
            const { tagIds, ...wineData } = input;

            return await prisma.wine.create({
                data: {
                    ...wineData,
                    tags: tagIds ? {
                        connect: tagIds.map((id: string) => ({ id })),
                    } : undefined,
                },
                include: {
                    winery: true,
                    varietal: true,
                    tags: true,
                    photos: true
                },
            });
        },

        updateWine: async (_: any, { id, input }: any) => {
            const { tagIds, ...wineData } = input;

            return await prisma.wine.update({
                where: { id },
                data: {
                    ...wineData,
                    tags: tagIds ? {
                        set: tagIds.map((tagId: string) => ({ id: tagId })),
                    } : undefined,
                },
                include: {
                    winery: true,
                    varietal: true,
                    tags: true,
                    photos: true
                },
            });
        },

        deleteWine: async (_: any, { id }: { id: string }, context: any) => {
            const { s3Client, S3_BUCKET_NAME } = context;

            // Get wine with photos to delete from S3
            const wine = await prisma.wine.findUnique({
                where: { id },
                include: { photos: true },
            });

            // Delete photos from S3
            if (wine?.photos && s3Client && S3_BUCKET_NAME) {
                for (const photo of wine.photos) {
                    if (photo.s3Key) {
                        try {
                            await s3Client.send(
                                new DeleteObjectCommand({
                                    Bucket: S3_BUCKET_NAME,
                                    Key: photo.s3Key,
                                })
                            );
                        } catch (error) {
                            console.error('Failed to delete photo from S3:', error);
                        }
                    }
                }
            }

            return await prisma.wine.delete({
                where: { id },
                include: {
                    winery: true,
                    varietal: true,
                    tags: true,
                    photos: true
                },
            });
        },

        updateWineQuantity: async (_: any, { id, quantity }: any) => {
            return await prisma.wine.update({
                where: { id },
                data: { quantity },
                include: {
                    winery: true,
                    varietal: true,
                    tags: true,
                    photos: true
                },
            });
        },
    },

    // Field Resolvers
    Wine: {
        varietal: async (parent: any) => {
            if (!parent.varietalId) return null;

            return await prisma.varietal.findUnique({
                where: { id: parent.varietalId },
            });
        },
    },
};