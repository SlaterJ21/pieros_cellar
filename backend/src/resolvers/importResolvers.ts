// src/graphql/resolvers/importResolvers.ts
import { PrismaClient, WineType, Sweetness, BottleSize, WineStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface ImportWineryInput {
    name: string;
    region?: string;
    country?: string;
    website?: string;
    description?: string;
    email?: string;
    phone?: string;
    foundedYear?: number;
    logo?: string;
}

interface ImportVarietalInput {
    name: string;
    type?: WineType;
    description?: string;
    commonRegions?: string[];
    characteristics?: string[];
    aliases?: string[];
}

interface ImportWineInput {
    name: string;
    wineryName: string;
    varietalName?: string;
    vintage?: number;
    region?: string;
    subRegion?: string;
    country?: string;
    appellation?: string;
    type: WineType;
    sweetness?: Sweetness;
    quantity?: number;
    bottleSize?: BottleSize;
    purchaseDate?: string;
    purchasePrice?: number;
    purchaseLocation?: string;
    retailer?: string;
    location?: string;
    binNumber?: string;
    rackNumber?: string;
    cellarZone?: string;
    drinkFrom?: number;
    drinkTo?: number;
    peakDrinking?: number;
    personalRating?: number;
    criticsRating?: number;
    criticName?: string;
    personalNotes?: string;
    tastingNotes?: string;
    currentValue?: number;
    estimatedValue?: number;
    status?: WineStatus;
    tags?: string[];
}

interface ImportCompleteCollectionInput {
    wineries?: ImportWineryInput[];
    varietals?: ImportVarietalInput[];
    wines?: ImportWineInput[];
}

interface ImportResult {
    imported: number;
    skipped: number;
    errors: string[];
}

export const importResolvers = {
    Mutation: {
        // Import single winery
        importWinery: async (_parent: any, { input }: { input: ImportWineryInput }) => {
            try {
                const existing = await prisma.winery.findUnique({
                    where: { name: input.name },
                });

                if (existing) {
                    return await prisma.winery.update({
                        where: { id: existing.id },
                        data: {
                            region: input.region,
                            country: input.country,
                            website: input.website,
                            description: input.description,
                            email: input.email,
                            phone: input.phone,
                            foundedYear: input.foundedYear,
                            logo: input.logo,
                        },
                    });
                }

                return await prisma.winery.create({
                    data: input,
                });
            } catch (error) {
                console.error('Error importing winery:', error);
                throw new Error(`Failed to import winery: ${input.name}`);
            }
        },

        // Import multiple wineries
        importWineries: async (_parent: any, { wineries }: { wineries: ImportWineryInput[] }) => {
            const result: ImportResult & { wineries: any[] } = {
                imported: 0,
                skipped: 0,
                errors: [],
                wineries: [],
            };

            for (const wineryInput of wineries) {
                try {
                    const existing = await prisma.winery.findUnique({
                        where: { name: wineryInput.name },
                    });

                    if (existing) {
                        const updated = await prisma.winery.update({
                            where: { id: existing.id },
                            data: {
                                region: wineryInput.region,
                                country: wineryInput.country,
                                website: wineryInput.website,
                                description: wineryInput.description,
                                email: wineryInput.email,
                                phone: wineryInput.phone,
                                foundedYear: wineryInput.foundedYear,
                                logo: wineryInput.logo,
                            },
                        });
                        result.wineries.push(updated);
                        result.skipped++;
                    } else {
                        const created = await prisma.winery.create({
                            data: wineryInput,
                        });
                        result.wineries.push(created);
                        result.imported++;
                    }
                } catch (error: any) {
                    result.errors.push(`${wineryInput.name}: ${error.message}`);
                }
            }

            return result;
        },

        // Import single varietal
        importVarietal: async (_parent: any, { input }: { input: ImportVarietalInput }) => {
            try {
                const existing = await prisma.varietal.findUnique({
                    where: { name: input.name },
                });

                if (existing) {
                    return await prisma.varietal.update({
                        where: { id: existing.id },
                        data: {
                            type: input.type,
                            description: input.description,
                            commonRegions: input.commonRegions || [],
                            characteristics: input.characteristics || [],
                            aliases: input.aliases || [],
                        },
                    });
                }

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
            } catch (error) {
                console.error('Error importing varietal:', error);
                throw new Error(`Failed to import varietal: ${input.name}`);
            }
        },

        // Import multiple varietals
        importVarietals: async (_parent: any, { varietals }: { varietals: ImportVarietalInput[] }) => {
            const result: ImportResult & { varietals: any[] } = {
                imported: 0,
                skipped: 0,
                errors: [],
                varietals: [],
            };

            for (const varietalInput of varietals) {
                try {
                    const existing = await prisma.varietal.findUnique({
                        where: { name: varietalInput.name },
                    });

                    if (existing) {
                        const updated = await prisma.varietal.update({
                            where: { id: existing.id },
                            data: {
                                type: varietalInput.type,
                                description: varietalInput.description,
                                commonRegions: varietalInput.commonRegions || [],
                                characteristics: varietalInput.characteristics || [],
                                aliases: varietalInput.aliases || [],
                            },
                        });
                        result.varietals.push(updated);
                        result.skipped++;
                    } else {
                        const created = await prisma.varietal.create({
                            data: {
                                name: varietalInput.name,
                                type: varietalInput.type,
                                description: varietalInput.description,
                                commonRegions: varietalInput.commonRegions || [],
                                characteristics: varietalInput.characteristics || [],
                                aliases: varietalInput.aliases || [],
                            },
                        });
                        result.varietals.push(created);
                        result.imported++;
                    }
                } catch (error: any) {
                    result.errors.push(`${varietalInput.name}: ${error.message}`);
                }
            }

            return result;
        },

        // Import single wine
        importWine: async (_parent: any, { input }: { input: ImportWineInput }) => {
            try {
                // Find or create winery
                let winery = await prisma.winery.findUnique({
                    where: { name: input.wineryName },
                });

                if (!winery) {
                    winery = await prisma.winery.create({
                        data: { name: input.wineryName },
                    });
                }

                // Find or create varietal (if provided)
                let varietalId: string | undefined;
                if (input.varietalName) {
                    let varietal = await prisma.varietal.findUnique({
                        where: { name: input.varietalName },
                    });

                    if (!varietal) {
                        varietal = await prisma.varietal.create({
                            data: { name: input.varietalName },
                        });
                    }
                    varietalId = varietal.id;
                }

                // Handle tags
                const tagConnections = [];
                if (input.tags && input.tags.length > 0) {
                    for (const tagName of input.tags) {
                        let tag = await prisma.tag.findUnique({
                            where: { name: tagName },
                        });

                        if (!tag) {
                            tag = await prisma.tag.create({
                                data: { name: tagName },
                            });
                        }
                        tagConnections.push({ id: tag.id });
                    }
                }

                // Create wine
                const wine = await prisma.wine.create({
                    data: {
                        name: input.name,
                        wineryId: winery.id,
                        varietalId,
                        vintage: input.vintage,
                        region: input.region,
                        subRegion: input.subRegion,
                        country: input.country,
                        appellation: input.appellation,
                        type: input.type,
                        sweetness: input.sweetness,
                        quantity: input.quantity ?? 1,
                        bottleSize: input.bottleSize ?? BottleSize.STANDARD,
                        purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : undefined,
                        purchasePrice: input.purchasePrice,
                        purchaseLocation: input.purchaseLocation,
                        retailer: input.retailer,
                        location: input.location,
                        binNumber: input.binNumber,
                        rackNumber: input.rackNumber,
                        cellarZone: input.cellarZone,
                        drinkFrom: input.drinkFrom,
                        drinkTo: input.drinkTo,
                        peakDrinking: input.peakDrinking,
                        personalRating: input.personalRating,
                        criticsRating: input.criticsRating,
                        criticName: input.criticName,
                        personalNotes: input.personalNotes,
                        tastingNotes: input.tastingNotes,
                        currentValue: input.currentValue,
                        estimatedValue: input.estimatedValue,
                        status: input.status ?? WineStatus.IN_CELLAR,
                        tags: tagConnections.length > 0 ? {
                            connect: tagConnections,
                        } : undefined,
                    },
                    include: {
                        winery: true,
                        varietal: true,
                    },
                });

                return wine;
            } catch (error) {
                console.error('Error importing wine:', error);
                throw new Error(`Failed to import wine: ${input.name}`);
            }
        },

        // Import multiple wines
        importWines: async (_parent: any, { wines }: { wines: ImportWineInput[] }) => {
            const result: ImportResult & { wines: any[] } = {
                imported: 0,
                skipped: 0,
                errors: [],
                wines: [],
            };

            // Pre-fetch all wineries and varietals to reduce queries
            const wineryNames = [...new Set(wines.map(w => w.wineryName))];
            const varietalNames = [...new Set(wines.map(w => w.varietalName).filter(Boolean))];

            const wineryMap = new Map();
            for (const name of wineryNames) {
                let winery = await prisma.winery.findUnique({ where: { name } });
                if (!winery) {
                    winery = await prisma.winery.create({ data: { name } });
                }
                wineryMap.set(name, winery);
            }

            const varietalMap = new Map();
            for (const name of varietalNames) {
                if (name) {
                    let varietal = await prisma.varietal.findUnique({ where: { name } });
                    if (!varietal) {
                        varietal = await prisma.varietal.create({ data: { name } });
                    }
                    varietalMap.set(name, varietal);
                }
            }

            // Import wines
            for (const wineInput of wines) {
                try {
                    const winery = wineryMap.get(wineInput.wineryName);
                    const varietal = wineInput.varietalName ? varietalMap.get(wineInput.varietalName) : null;

                    // Handle tags
                    const tagConnections = [];
                    if (wineInput.tags && wineInput.tags.length > 0) {
                        for (const tagName of wineInput.tags) {
                            let tag = await prisma.tag.findUnique({ where: { name: tagName } });
                            if (!tag) {
                                tag = await prisma.tag.create({ data: { name: tagName } });
                            }
                            tagConnections.push({ id: tag.id });
                        }
                    }

                    const wine = await prisma.wine.create({
                        data: {
                            name: wineInput.name,
                            wineryId: winery.id,
                            varietalId: varietal?.id,
                            vintage: wineInput.vintage,
                            region: wineInput.region,
                            subRegion: wineInput.subRegion,
                            country: wineInput.country,
                            appellation: wineInput.appellation,
                            type: wineInput.type,
                            sweetness: wineInput.sweetness,
                            quantity: wineInput.quantity ?? 1,
                            bottleSize: wineInput.bottleSize ?? BottleSize.STANDARD,
                            purchaseDate: wineInput.purchaseDate ? new Date(wineInput.purchaseDate) : undefined,
                            purchasePrice: wineInput.purchasePrice,
                            purchaseLocation: wineInput.purchaseLocation,
                            retailer: wineInput.retailer,
                            location: wineInput.location,
                            binNumber: wineInput.binNumber,
                            rackNumber: wineInput.rackNumber,
                            cellarZone: wineInput.cellarZone,
                            drinkFrom: wineInput.drinkFrom,
                            drinkTo: wineInput.drinkTo,
                            peakDrinking: wineInput.peakDrinking,
                            personalRating: wineInput.personalRating,
                            criticsRating: wineInput.criticsRating,
                            criticName: wineInput.criticName,
                            personalNotes: wineInput.personalNotes,
                            tastingNotes: wineInput.tastingNotes,
                            currentValue: wineInput.currentValue,
                            estimatedValue: wineInput.estimatedValue,
                            status: wineInput.status ?? WineStatus.IN_CELLAR,
                            tags: tagConnections.length > 0 ? {
                                connect: tagConnections,
                            } : undefined,
                        },
                        include: {
                            winery: true,
                            varietal: true,
                        },
                    });

                    result.wines.push(wine);
                    result.imported++;
                } catch (error: any) {
                    result.errors.push(`${wineInput.name}: ${error.message}`);
                }
            }

            return result;
        },

        // Import complete collection
        importCompleteCollection: async (_parent: any, { input }: { input: ImportCompleteCollectionInput }) => {
            const result = {
                wineries: { imported: 0, skipped: 0, errors: [] as string[] },
                varietals: { imported: 0, skipped: 0, errors: [] as string[] },
                wines: { imported: 0, skipped: 0, errors: [] as string[] },
                tags: { imported: 0, skipped: 0, errors: [] as string[] },
            };

            try {
                // Import wineries first
                if (input.wineries && input.wineries.length > 0) {
                    const wineriesResult = await importResolvers.Mutation.importWineries(null, { wineries: input.wineries });
                    result.wineries.imported = wineriesResult.imported;
                    result.wineries.skipped = wineriesResult.skipped;
                    result.wineries.errors = wineriesResult.errors;
                }

                // Import varietals second
                if (input.varietals && input.varietals.length > 0) {
                    const varietalsResult = await importResolvers.Mutation.importVarietals(null, { varietals: input.varietals });
                    result.varietals.imported = varietalsResult.imported;
                    result.varietals.skipped = varietalsResult.skipped;
                    result.varietals.errors = varietalsResult.errors;
                }

                // Import wines last (depends on wineries and varietals)
                if (input.wines && input.wines.length > 0) {
                    const winesResult = await importResolvers.Mutation.importWines(null, { wines: input.wines });
                    result.wines.imported = winesResult.imported;
                    result.wines.skipped = winesResult.skipped;
                    result.wines.errors = winesResult.errors;
                }

                return result;
            } catch (error) {
                console.error('Error importing complete collection:', error);
                throw new Error('Failed to import complete collection');
            }
        },
    },
};