// src/graphql/resolvers/miscResolvers.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const miscResolvers = {
    Query: {
        tags: async () => {
            return await prisma.tag.findMany({
                include: { wines: true },
                orderBy: { name: 'asc' },
            });
        },

        cellarLocations: async () => {
            return await prisma.cellarLocation.findMany({
                orderBy: { name: 'asc' },
            });
        },
    },

    Mutation: {
        createTag: async (_: any, { name, color }: any) => {
            return await prisma.tag.create({
                data: { name, color },
            });
        },

        deleteTag: async (_: any, { id }: { id: string }) => {
            return await prisma.tag.delete({
                where: { id },
            });
        },

        createCellarLocation: async (_: any, args: any) => {
            return await prisma.cellarLocation.create({
                data: args,
            });
        },
    },
};