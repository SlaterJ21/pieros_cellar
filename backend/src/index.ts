// src/index.ts
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { resolvers } from './resolvers';

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

export const typeDefs = `
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

  # Import Result Types
  type ImportResult {
    imported: Int!
    skipped: Int!
    errors: [String!]!
  }

  type WineryImportResult {
    imported: Int!
    skipped: Int!
    errors: [String!]!
    wineries: [Winery!]!
  }

  type VarietalImportResult {
    imported: Int!
    skipped: Int!
    errors: [String!]!
    varietals: [Varietal!]!
  }

  type WineImportResult {
    imported: Int!
    skipped: Int!
    errors: [String!]!
    wines: [Wine!]!
  }

  type CompleteCollectionImportResult {
    wineries: ImportResult!
    varietals: ImportResult!
    wines: ImportResult!
    tags: ImportResult!
  }

  # Input Types
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

  # Import Input Types
  input ImportWineryInput {
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

  input ImportVarietalInput {
    name: String!
    type: WineType
    description: String
    commonRegions: [String!]
    characteristics: [String!]
    aliases: [String!]
  }

  input ImportWineInput {
    name: String!
    wineryName: String!
    varietalName: String
    vintage: Int
    region: String
    subRegion: String
    country: String
    appellation: String
    type: WineType!
    sweetness: Sweetness
    quantity: Int
    bottleSize: BottleSize
    purchaseDate: String
    purchasePrice: Float
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
    currentValue: Float
    estimatedValue: Float
    status: WineStatus
    tags: [String!]
  }

  input ImportCompleteCollectionInput {
    wineries: [ImportWineryInput!]
    varietals: [ImportVarietalInput!]
    wines: [ImportWineInput!]
  }

  type Query {
    # Wine Queries
    wines(filter: WineFilterInput, skip: Int, take: Int): [Wine!]!
    wine(id: ID!): Wine
    wineStats: WineStats!
    
    # Winery Queries
    wineries(search: String): [Winery!]!
    winery(id: ID!): Winery
    
    # Varietal Queries
    varietals(type: WineType, search: String): [Varietal!]!
    varietal(id: ID!): Varietal
    varietalByName(name: String!): Varietal
    
    # Other Queries
    tags: [Tag!]!
    cellarLocations: [CellarLocation!]!
  }

  type Mutation {
    # Wine Mutations
    createWine(input: WineInput!): Wine!
    updateWine(id: ID!, input: WineInput!): Wine!
    deleteWine(id: ID!): Wine!
    updateWineQuantity(id: ID!, quantity: Int!): Wine!
    
    # Winery Mutations
    createWinery(input: WineryInput!): Winery!
    updateWinery(id: ID!, input: WineryInput!): Winery!
    deleteWinery(id: ID!): Winery!
    
    # Varietal Mutations
    createVarietal(input: CreateVarietalInput!): Varietal!
    updateVarietal(id: ID!, input: UpdateVarietalInput!): Varietal!
    deleteVarietal(id: ID!): Boolean!
    
    # Tag Mutations
    createTag(name: String!, color: String): Tag!
    deleteTag(id: ID!): Tag!
    
    # Photo Mutations
    addPhotoToWine(wineId: ID!, url: String!, s3Key: String, type: PhotoType, caption: String, isPrimary: Boolean): Photo!
    updatePhoto(id: ID!, caption: String, type: PhotoType): Photo!
    deletePhoto(id: ID!): Photo!
    setPrimaryPhoto(id: ID!): Photo!
    
    # Cellar Location Mutations
    createCellarLocation(name: String!, description: String, capacity: Int, temperature: String, humidity: String): CellarLocation!
    
    # Legacy CSV Import (if you want to keep it)
    importWinesFromCSV(csvData: String!): [Wine!]!
    
    # Import Mutations (NEW!)
    importWinery(input: ImportWineryInput!): Winery!
    importVarietal(input: ImportVarietalInput!): Varietal!
    importWine(input: ImportWineInput!): Wine!
    importWineries(wineries: [ImportWineryInput!]!): WineryImportResult!
    importVarietals(varietals: [ImportVarietalInput!]!): VarietalImportResult!
    importWines(wines: [ImportWineInput!]!): WineImportResult!
    importCompleteCollection(input: ImportCompleteCollectionInput!): CompleteCollectionImportResult!
  }
`;

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

    const PORT = parseInt(process.env.PORT || '4000', 10);

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server ready at http://0.0.0.0:${PORT}${server.graphqlPath}`);
        console.log(`📤 Upload endpoint: http://0.0.0.0:${PORT}/api/upload-photo`);
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