import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const wineryResolvers = {
    Query: {
        wineries: async (_: any, { search }: { search?: string }) => {
            const where = search ? {
                name: { contains: search, mode: 'insensitive' as const }
            } : {};

            return await prisma.winery.findMany({
                where,
                include: { wines: true },
                orderBy: { name: 'asc' },
            });
        },

        winery: async (_: any, { id }: { id: string }) => {
            return await prisma.winery.findUnique({
                where: { id },
                include: { wines: true },
            });
        },
    },

    Mutation: {
        createWinery: async (_: any, { input }: any) => {
            return await prisma.winery.create({
                data: input,
            });
        },

        updateWinery: async (_: any, { id, input }: any) => {
            return await prisma.winery.update({
                where: { id },
                data: input,
            });
        },

        deleteWinery: async (_: any, { id }: { id: string }) => {
            // Check if winery has wines
            const winery = await prisma.winery.findUnique({
                where: { id },
                include: { wines: true },
            });

            if (winery?.wines.length) {
                throw new Error('Cannot delete winery with existing wines');
            }

            return await prisma.winery.delete({
                where: { id },
            });
        },
    },
};