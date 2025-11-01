// src/graphql/resolvers/index.ts
import { wineResolvers } from './wineResolvers';
import { wineryResolvers } from './wineryResolvers';
import { varietalResolvers } from './varietalResolvers';
import { photoResolvers } from './photoResolvers';
import { miscResolvers } from './miscResolvers';
import { importResolvers } from './importResolvers';

// Merge all resolvers
export const resolvers = {
    Query: {
        ...wineResolvers.Query,
        ...wineryResolvers.Query,
        ...varietalResolvers.Query,
        ...miscResolvers.Query,
    },
    Mutation: {
        ...wineResolvers.Mutation,
        ...wineryResolvers.Mutation,
        ...varietalResolvers.Mutation,
        ...photoResolvers.Mutation,
        ...miscResolvers.Mutation,
        ...importResolvers.Mutation,
    },
    // Field resolvers
    Wine: wineResolvers.Wine,
    Varietal: varietalResolvers.Varietal,
    Photo: photoResolvers.Photo,
};