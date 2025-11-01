// src/index.ts
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { generatePresignedUrl } from './utils/s3-presigned';

const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
});

// Initialize S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;

// Configure Multer with S3
const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: S3_BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, {
                fieldName: file.fieldname,
                originalName: file.originalname,
                uploadedAt: new Date().toISOString(),
            });
        },
        key: (req, file, cb) => {
            const fileExtension = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
            const uniqueKey = `wines/${uuidv4()}.${fileExtension}`;
            cb(null, uniqueKey);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
    }),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/heic',
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and HEIC images are allowed.'));
        }
    },
});

const typeDefs = `
  scalar DateTime
  scalar Decimal

  enum WineType {
    RED
    WHITE
    ROSE
    SPARKLING
    DESSERT
    FORTIFIED
    ORANGE
  }

  enum Sweetness {
    BONE_DRY
    DRY
    OFF_DRY
    MEDIUM_SWEET
    SWEET
    VERY_SWEET
  }

  enum BottleSize {
    HALF
    STANDARD
    MAGNUM
    DOUBLE_MAGNUM
    JEROBOAM
    IMPERIAL
  }

  enum WineStatus {
    IN_CELLAR
    READY_TO_DRINK
    PAST_PEAK
    RESERVED
    CONSUMED
    GIFTED
    SOLD
  }

  enum PhotoType {
    LABEL
    BOTTLE
    CORK
    POUR
    OTHER
  }

  type Varietal {
    id: ID!
    name: String!
    type: WineType
    description: String
    commonRegions: [String!]!
    characteristics: [String!]!
    aliases: [String!]!
    wines: [Wine!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Winery {
    id: ID!
    name: String!
    region: String
    country: String
    website: String
    description: String
    email: String
    phone: String
    foundedYear: Int
    logo: String
    wines: [Wine!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Wine {
    id: ID!
    name: String!
    winery: Winery!
    wineryId: String!
    vintage: Int
    varietal: Varietal
    varietalId: String
    region: String
    subRegion: String
    country: String
    appellation: String
    type: WineType!
    sweetness: Sweetness
    quantity: Int!
    bottleSize: BottleSize!
    purchaseDate: DateTime
    purchasePrice: Decimal
    purchaseLocation: String
    retailer: String
    location: String
    binNumber: String
    rackNumber: String
    cellarZone: String
    drinkFrom: Int
    drinkTo: Int
    peakDrinking: Int
    personalRating: Int
    criticsRating: Int
    criticName: String
    personalNotes: String
    tastingNotes: String
    currentValue: Decimal
    estimatedValue: Decimal
    tags: [Tag!]!
    photos: [Photo!]!
    status: WineStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Tag {
    id: ID!
    name: String!
    color: String
    wines: [Wine!]!
    createdAt: DateTime!
  }

  type Photo {
    id: ID!
    wine: Wine!
    wineId: String!
    url: String!
    s3Key: String
    type: PhotoType!
    caption: String
    isPrimary: Boolean!
    createdAt: DateTime!
  }

  type CellarLocation {
    id: ID!
    name: String!
    description: String
    capacity: Int
    temperature: String
    humidity: String
    createdAt: DateTime!
  }

  type WineStats {
    totalBottles: Int!
    totalValue: Decimal!
    byType: [TypeCount!]!
    byCountry: [CountryCount!]!
    readyToDrink: Int!
  }

  type TypeCount {
    type: WineType!
    count: Int!
  }

  type CountryCount {
    country: String!
    count: Int!
  }

  input CreateVarietalInput {
    name: String!
    type: WineType
    description: String
    commonRegions: [String!]
    characteristics: [String!]
    aliases: [String!]
  }

  input UpdateVarietalInput {
    name: String
    type: WineType
    description: String
    commonRegions: [String!]
    characteristics: [String!]
    aliases: [String!]
  }

  input WineryInput {
    name: String!
    region: String
    country: String
    website: String
    description: String
    email: String
    phone: String
    foundedYear: Int
    logo: String
  }

  input WineInput {
    name: String!
    wineryId: String!
    vintage: Int
    varietalId: String
    region: String
    subRegion: String
    country: String
    appellation: String
    type: WineType
    sweetness: Sweetness
    quantity: Int
    bottleSize: BottleSize
    purchaseDate: DateTime
    purchasePrice: Decimal
    purchaseLocation: String
    retailer: String
    location: String
    binNumber: String
    rackNumber: String
    cellarZone: String
    drinkFrom: Int
    drinkTo: Int
    peakDrinking: Int
    personalRating: Int
    criticsRating: Int
    criticName: String
    personalNotes: String
    tastingNotes: String
    currentValue: Decimal
    estimatedValue: Decimal
    status: WineStatus
    tagIds: [ID!]
  }

  input WineFilterInput {
    type: WineType
    country: String
    region: String
    status: WineStatus
    wineryId: String
    varietalId: String
    minVintage: Int
    maxVintage: Int
    minPrice: Decimal
    maxPrice: Decimal
    search: String
  }

  type Query {
    wines(filter: WineFilterInput, skip: Int, take: Int): [Wine!]!
    wine(id: ID!): Wine
    wineStats: WineStats!
    
    wineries(search: String): [Winery!]!
    winery(id: ID!): Winery
    
    varietals(type: WineType, search: String): [Varietal!]!
    varietal(id: ID!): Varietal
    varietalByName(name: String!): Varietal
    
    tags: [Tag!]!
    cellarLocations: [CellarLocation!]!
  }

  type Mutation {
    createWine(input: WineInput!): Wine!
    updateWine(id: ID!, input: WineInput!): Wine!
    deleteWine(id: ID!): Wine!
    updateWineQuantity(id: ID!, quantity: Int!): Wine!
    
    createWinery(input: WineryInput!): Winery!
    updateWinery(id: ID!, input: WineryInput!): Winery!
    deleteWinery(id: ID!): Winery!
    
    createVarietal(input: CreateVarietalInput!): Varietal!
    updateVarietal(id: ID!, input: UpdateVarietalInput!): Varietal!
    deleteVarietal(id: ID!): Boolean!
    
    createTag(name: String!, color: String): Tag!
    deleteTag(id: ID!): Tag!
    
    addPhotoToWine(wineId: ID!, url: String!, s3Key: String, type: PhotoType, caption: String, isPrimary: Boolean): Photo!
    updatePhoto(id: ID!, caption: String, type: PhotoType): Photo!
    deletePhoto(id: ID!): Photo!
    setPrimaryPhoto(id: ID!): Photo!
    
    createCellarLocation(name: String!, description: String, capacity: Int, temperature: String, humidity: String): CellarLocation!
    
    importWinesFromCSV(csvData: String!): [Wine!]!
  }
`;

const resolvers = {
    Query: {
        // Varietal Queries
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

        // Wine Queries
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

        // Winery Queries
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

        // Other Queries
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
        // Varietal Mutations
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

        // Wine Mutations
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

        deleteWine: async (_: any, { id }: { id: string }) => {
            // Get wine with photos to delete from S3
            const wine = await prisma.wine.findUnique({
                where: { id },
                include: { photos: true },
            });

            // Delete photos from S3
            if (wine?.photos) {
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

        // Winery Mutations
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

        // Tag Mutations
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

        // Photo Mutations
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

        deletePhoto: async (_: any, { id }: { id: string }) => {
            const photo = await prisma.photo.findUnique({
                where: { id },
            });

            if (!photo) {
                throw new Error('Photo not found');
            }

            // Delete from S3 if s3Key exists
            if (photo.s3Key) {
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

        // Cellar Location Mutations
        createCellarLocation: async (_: any, args: any) => {
            return await prisma.cellarLocation.create({
                data: args,
            });
        },

        importWinesFromCSV: async (_: any, { csvData }: { csvData: string }) => {
            // Will implement next
            return [];
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

    Wine: {
        varietal: async (parent: any) => {
            if (!parent.varietalId) return null;

            return await prisma.varietal.findUnique({
                where: { id: parent.varietalId },
            });
        },
    },

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

async function startServer() {
    const app = express();

    app.use(cors({
        origin: '*',
        credentials: true,
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: 'connected',
            s3Bucket: S3_BUCKET_NAME || 'not configured',
        });
    });

    // Photo upload endpoint
    app.post('/api/upload-photo', upload.single('file'), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    error: 'No file uploaded',
                    success: false
                });
            }

            const fileUrl = (req.file as any).location;
            const fileKey = (req.file as any).key;

            res.json({
                success: true,
                url: fileUrl,
                key: fileKey,
                size: req.file.size,
                mimetype: req.file.mimetype,
                bucket: S3_BUCKET_NAME,
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                error: 'Upload failed',
                message: error instanceof Error ? error.message : 'Unknown error',
                success: false,
            });
        }
    });

    // Delete photo from S3 endpoint
    app.delete('/api/photo/:key(*)', async (req, res) => {
        try {
            const key = req.params.key;

            if (!key) {
                return res.status(400).json({
                    error: 'Photo key is required',
                    success: false
                });
            }

            await s3Client.send(
                new DeleteObjectCommand({
                    Bucket: S3_BUCKET_NAME,
                    Key: key,
                })
            );

            res.json({
                success: true,
                message: 'Photo deleted successfully',
                key: key,
            });
        } catch (error) {
            console.error('Delete error:', error);
            res.status(500).json({
                error: 'Delete failed',
                message: error instanceof Error ? error.message : 'Unknown error',
                success: false,
            });
        }
    });

    // GraphQL server setup
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: () => ({ prisma, s3Client }),
        introspection: true,
        formatError: (error) => {
            console.error('GraphQL Error:', error);
            return error;
        },
    });

    await server.start();
    server.applyMiddleware({
        app: app as any,
        cors: false,
        path: '/graphql',
    });

    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
        console.log(`📤 Upload endpoint: http://localhost:${PORT}/api/upload-photo`);
        console.log(`📊 Database connected: ${prisma ? '✅' : '❌'}`);
        console.log(`🪣 S3 Bucket: ${S3_BUCKET_NAME || '❌ Not configured'}`);
    });
}

process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

startServer().catch(async (error) => {
    console.error('❌ Error starting server:', error);
    await prisma.$disconnect();
    process.exit(1);
});