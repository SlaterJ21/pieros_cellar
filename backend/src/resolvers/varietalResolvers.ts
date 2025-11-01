// src/graphql/resolvers/varietalResolvers.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const varietalResolvers = {
    Query: {
        varietals: async (_parent: any, args: { type?: string; search?: string }) => {
            const { type, search } = args;

            return await prisma.varietal.findMany({
                where: {
                    ...(type && { type: type as any }),
                    ...(search && {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { aliases: { has: search } },
                        ],
                    }),
                },
                orderBy: { name: 'asc' },
            });
        },

        varietal: async (_parent: any, args: { id: string }) => {
            return await prisma.varietal.findUnique({
                where: { id: args.id },
                include: {
                    wines: {
                        include: {
                            winery: true,
                            photos: {
                                where: { isPrimary: true },
                                take: 1,
                            },
                        },
                    },
                },
            });
        },

        varietalByName: async (_parent: any, args: { name: string }) => {
            return await prisma.varietal.findUnique({
                where: { name: args.name },
            });
        },
    },

    Mutation: {
        createVarietal: async (_parent: any, args: { input: any }) => {
            const { input } = args;

            return await prisma.varietal.create({
                data: {
                    name: input.name,
                    type: input.type,
                    description: input.description,
                    commonRegions: input.commonRegions || [],
                    characteristics: input.characteristics || [],
                    aliases: input.aliases || [],
                },
            });
        },

        updateVarietal: async (_parent: any, args: { id: string; input: any }) => {
            const { id, input } = args;

            return await prisma.varietal.update({
                where: { id },
                data: {
                    ...(input.name && { name: input.name }),
                    ...(input.type !== undefined && { type: input.type }),
                    ...(input.description !== undefined && { description: input.description }),
                    ...(input.commonRegions !== undefined && { commonRegions: input.commonRegions }),
                    ...(input.characteristics !== undefined && { characteristics: input.characteristics }),
                    ...(input.aliases !== undefined && { aliases: input.aliases }),
                },
            });
        },

        deleteVarietal: async (_parent: any, args: { id: string }) => {
            const { id } = args;

            // Check if any wines are using this varietal
            const wineCount = await prisma.wine.count({
                where: { varietalId: id },
            });

            if (wineCount > 0) {
                throw new Error(`Cannot delete varietal: ${wineCount} wine(s) are linked to it`);
            }

            await prisma.varietal.delete({
                where: { id },
            });

            return true;
        },
    },

    // Field Resolvers
    Varietal: {
        wines: async (parent: any) => {
            return await prisma.wine.findMany({
                where: { varietalId: parent.id },
                include: {
                    winery: true,
                    varietal: true,
                    photos: {
                        where: { isPrimary: true },
                        take: 1,
                    },
                },
            });
        },
    },
};