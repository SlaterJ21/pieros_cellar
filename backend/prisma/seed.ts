// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Wine types distribution
const wineTypes = ['RED', 'WHITE', 'ROSE', 'SPARKLING', 'DESSERT', 'FORTIFIED', 'ORANGE'];
const sweetness = ['BONE_DRY', 'DRY', 'OFF_DRY', 'MEDIUM_SWEET', 'SWEET', 'VERY_SWEET'];
const bottleSizes = ['HALF', 'STANDARD', 'MAGNUM', 'DOUBLE_MAGNUM', 'JEROBOAM', 'IMPERIAL'];
const wineStatus = ['IN_CELLAR', 'READY_TO_DRINK', 'PAST_PEAK', 'RESERVED'];
type Tags = {
    id: string;
    name: string;
    createdAt: Date;
    color: string | null;
};

// Famous wine regions by country
const wineriesData = [
    // USA - California (25 wineries)
    { name: 'Opus One Winery', region: 'Napa Valley', country: 'USA', foundedYear: 1979 },
    { name: 'Screaming Eagle', region: 'Oakville', country: 'USA', foundedYear: 1986 },
    { name: 'Harlan Estate', region: 'Oakville', country: 'USA', foundedYear: 1984 },
    { name: 'Stag\'s Leap Wine Cellars', region: 'Napa Valley', country: 'USA', foundedYear: 1970 },
    { name: 'Caymus Vineyards', region: 'Rutherford', country: 'USA', foundedYear: 1972 },
    { name: 'Silver Oak Cellars', region: 'Oakville', country: 'USA', foundedYear: 1972 },
    { name: 'Joseph Phelps Vineyards', region: 'St. Helena', country: 'USA', foundedYear: 1973 },
    { name: 'Shafer Vineyards', region: 'Stags Leap District', country: 'USA', foundedYear: 1978 },
    { name: 'Ridge Vineyards', region: 'Santa Cruz Mountains', country: 'USA', foundedYear: 1962 },
    { name: 'Beringer Vineyards', region: 'St. Helena', country: 'USA', foundedYear: 1876 },
    { name: 'Robert Mondavi Winery', region: 'Oakville', country: 'USA', foundedYear: 1966 },
    { name: 'Dominus Estate', region: 'Yountville', country: 'USA', foundedYear: 1983 },
    { name: 'Peter Michael Winery', region: 'Knights Valley', country: 'USA', foundedYear: 1982 },
    { name: 'Kistler Vineyards', region: 'Sonoma Valley', country: 'USA', foundedYear: 1978 },
    { name: 'Duckhorn Vineyards', region: 'Napa Valley', country: 'USA', foundedYear: 1976 },
    { name: 'Far Niente Winery', region: 'Oakville', country: 'USA', foundedYear: 1885 },
    { name: 'Heitz Cellar', region: 'St. Helena', country: 'USA', foundedYear: 1961 },
    { name: 'Schramsberg Vineyards', region: 'Calistoga', country: 'USA', foundedYear: 1862 },
    { name: 'Continuum Estate', region: 'Pritchard Hill', country: 'USA', foundedYear: 2005 },
    { name: 'Colgin Cellars', region: 'Napa Valley', country: 'USA', foundedYear: 1992 },
    { name: 'Bryant Family Vineyard', region: 'Pritchard Hill', country: 'USA', foundedYear: 1992 },
    { name: 'Dalla Valle Vineyards', region: 'Oakville', country: 'USA', foundedYear: 1986 },
    { name: 'Pride Mountain Vineyards', region: 'Spring Mountain', country: 'USA', foundedYear: 1990 },
    { name: 'Spottswoode Estate', region: 'St. Helena', country: 'USA', foundedYear: 1882 },
    { name: 'Kongsgaard Wine', region: 'Napa Valley', country: 'USA', foundedYear: 1996 },

    // France - Bordeaux (20 wineries)
    { name: 'Château Margaux', region: 'Margaux', country: 'France', foundedYear: 1815 },
    { name: 'Château Lafite Rothschild', region: 'Pauillac', country: 'France', foundedYear: 1868 },
    { name: 'Château Latour', region: 'Pauillac', country: 'France', foundedYear: 1378 },
    { name: 'Château Mouton Rothschild', region: 'Pauillac', country: 'France', foundedYear: 1853 },
    { name: 'Château Haut-Brion', region: 'Pessac-Léognan', country: 'France', foundedYear: 1533 },
    { name: 'Château Pétrus', region: 'Pomerol', country: 'France', foundedYear: 1925 },
    { name: 'Château Le Pin', region: 'Pomerol', country: 'France', foundedYear: 1979 },
    { name: 'Château Lafleur', region: 'Pomerol', country: 'France', foundedYear: 1872 },
    { name: 'Château Cheval Blanc', region: 'Saint-Émilion', country: 'France', foundedYear: 1832 },
    { name: 'Château Ausone', region: 'Saint-Émilion', country: 'France', foundedYear: 1781 },
    { name: 'Château Pavie', region: 'Saint-Émilion', country: 'France', foundedYear: 1998 },
    { name: 'Château Palmer', region: 'Margaux', country: 'France', foundedYear: 1814 },
    { name: 'Château Cos d\'Estournel', region: 'Saint-Estèphe', country: 'France', foundedYear: 1810 },
    { name: 'Château Montrose', region: 'Saint-Estèphe', country: 'France', foundedYear: 1815 },
    { name: 'Château Pichon Longueville', region: 'Pauillac', country: 'France', foundedYear: 1850 },
    { name: 'Château Léoville Las Cases', region: 'Saint-Julien', country: 'France', foundedYear: 1840 },
    { name: 'Château Ducru-Beaucaillou', region: 'Saint-Julien', country: 'France', foundedYear: 1795 },
    { name: 'Château Lynch-Bages', region: 'Pauillac', country: 'France', foundedYear: 1855 },
    { name: 'Château Pontet-Canet', region: 'Pauillac', country: 'France', foundedYear: 1705 },
    { name: 'Château d\'Yquem', region: 'Sauternes', country: 'France', foundedYear: 1593 },

    // France - Burgundy (15 wineries)
    { name: 'Domaine de la Romanée-Conti', region: 'Vosne-Romanée', country: 'France', foundedYear: 1869 },
    { name: 'Domaine Leroy', region: 'Vosne-Romanée', country: 'France', foundedYear: 1988 },
    { name: 'Domaine Armand Rousseau', region: 'Gevrey-Chambertin', country: 'France', foundedYear: 1954 },
    { name: 'Domaine Georges Roumier', region: 'Chambolle-Musigny', country: 'France', foundedYear: 1924 },
    { name: 'Domaine Leflaive', region: 'Puligny-Montrachet', country: 'France', foundedYear: 1717 },
    { name: 'Domaine Coche-Dury', region: 'Meursault', country: 'France', foundedYear: 1973 },
    { name: 'Domaine Ramonet', region: 'Chassagne-Montrachet', country: 'France', foundedYear: 1920 },
    { name: 'Domaine Comte Georges de Vogüé', region: 'Chambolle-Musigny', country: 'France', foundedYear: 1925 },
    { name: 'Domaine Dujac', region: 'Morey-Saint-Denis', country: 'France', foundedYear: 1967 },
    { name: 'Domaine Hubert Lignier', region: 'Morey-Saint-Denis', country: 'France', foundedYear: 1880 },
    { name: 'Domaine Ponsot', region: 'Morey-Saint-Denis', country: 'France', foundedYear: 1872 },
    { name: 'Domaine Denis Mortet', region: 'Gevrey-Chambertin', country: 'France', foundedYear: 1956 },
    { name: 'Domaine Méo-Camuzet', region: 'Vosne-Romanée', country: 'France', foundedYear: 1902 },
    { name: 'Domaine Faiveley', region: 'Nuits-Saint-Georges', country: 'France', foundedYear: 1825 },
    { name: 'Bouchard Père & Fils', region: 'Beaune', country: 'France', foundedYear: 1731 },

    // France - Rhône (5 wineries)
    { name: 'Domaine Jean-Louis Chave', region: 'Hermitage', country: 'France', foundedYear: 1481 },
    { name: 'Château de Beaucastel', region: 'Châteauneuf-du-Pape', country: 'France', foundedYear: 1549 },
    { name: 'Château Rayas', region: 'Châteauneuf-du-Pape', country: 'France', foundedYear: 1880 },
    { name: 'M. Chapoutier', region: 'Hermitage', country: 'France', foundedYear: 1808 },
    { name: 'Paul Jaboulet Aîné', region: 'Hermitage', country: 'France', foundedYear: 1834 },

    // Italy - Tuscany (10 wineries)
    { name: 'Tenuta San Guido', region: 'Bolgheri', country: 'Italy', foundedYear: 1944 },
    { name: 'Antinori', region: 'Tuscany', country: 'Italy', foundedYear: 1385 },
    { name: 'Ornellaia', region: 'Bolgheri', country: 'Italy', foundedYear: 1981 },
    { name: 'Masseto', region: 'Bolgheri', country: 'Italy', foundedYear: 1986 },
    { name: 'Biondi-Santi', region: 'Montalcino', country: 'Italy', foundedYear: 1888 },
    { name: 'Soldera Case Basse', region: 'Montalcino', country: 'Italy', foundedYear: 1972 },
    { name: 'Castello di Ama', region: 'Chianti Classico', country: 'Italy', foundedYear: 1972 },
    { name: 'Fontodi', region: 'Chianti Classico', country: 'Italy', foundedYear: 1968 },
    { name: 'Tua Rita', region: 'Tuscany', country: 'Italy', foundedYear: 1984 },
    { name: 'Isole e Olena', region: 'Chianti Classico', country: 'Italy', foundedYear: 1956 },

    // Italy - Piedmont (5 wineries)
    { name: 'Gaja', region: 'Barbaresco', country: 'Italy', foundedYear: 1859 },
    { name: 'Bruno Giacosa', region: 'Barolo', country: 'Italy', foundedYear: 1961 },
    { name: 'Giuseppe Rinaldi', region: 'Barolo', country: 'Italy', foundedYear: 1890 },
    { name: 'Giacomo Conterno', region: 'Barolo', country: 'Italy', foundedYear: 1908 },
    { name: 'Produttori del Barbaresco', region: 'Barbaresco', country: 'Italy', foundedYear: 1958 },

    // Spain (5 wineries)
    { name: 'Vega Sicilia', region: 'Ribera del Duero', country: 'Spain', foundedYear: 1864 },
    { name: 'Pingus', region: 'Ribera del Duero', country: 'Spain', foundedYear: 1995 },
    { name: 'Álvaro Palacios', region: 'Priorat', country: 'Spain', foundedYear: 1989 },
    { name: 'Clos Mogador', region: 'Priorat', country: 'Spain', foundedYear: 1979 },
    { name: 'Artadi', region: 'Rioja', country: 'Spain', foundedYear: 1985 },

    // Australia (5 wineries)
    { name: 'Penfolds', region: 'Barossa Valley', country: 'Australia', foundedYear: 1844 },
    { name: 'Henschke', region: 'Eden Valley', country: 'Australia', foundedYear: 1868 },
    { name: 'Torbreck', region: 'Barossa Valley', country: 'Australia', foundedYear: 1994 },
    { name: 'Clarendon Hills', region: 'McLaren Vale', country: 'Australia', foundedYear: 1989 },
    { name: 'Cullen Wines', region: 'Margaret River', country: 'Australia', foundedYear: 1971 },

    // Chile (3 wineries)
    { name: 'Viña Almaviva', region: 'Maipo Valley', country: 'Chile', foundedYear: 1997 },
    { name: 'Seña', region: 'Aconcagua Valley', country: 'Chile', foundedYear: 1995 },
    { name: 'Viña Errázuriz', region: 'Aconcagua Valley', country: 'Chile', foundedYear: 1870 },

    // Argentina (2 wineries)
    { name: 'Catena Zapata', region: 'Mendoza', country: 'Argentina', foundedYear: 1902 },
    { name: 'Bodega Chacra', region: 'Patagonia', country: 'Argentina', foundedYear: 2004 },

    // Germany (3 wineries)
    { name: 'Egon Müller', region: 'Mosel', country: 'Germany', foundedYear: 1797 },
    { name: 'JJ Prüm', region: 'Mosel', country: 'Germany', foundedYear: 1911 },
    { name: 'Keller', region: 'Rheinhessen', country: 'Germany', foundedYear: 1789 },

    // New Zealand (2 wineries)
    { name: 'Cloudy Bay', region: 'Marlborough', country: 'New Zealand', foundedYear: 1985 },
    { name: 'Kumeu River', region: 'Auckland', country: 'New Zealand', foundedYear: 1944 },
];

// Wine names by varietal/type
const wineNamesData = {
    'Cabernet Sauvignon': ['Reserve', 'Estate Reserve', 'Private Reserve', 'Grand Vin', 'Special Selection'],
    'Pinot Noir': ['Reserve', 'Estate', 'Premier Cru', 'Grand Cru', 'La Tâche'],
    'Merlot': ['Reserve', 'Estate', 'Grand Vin'],
    'Syrah': ['Reserve', 'Hermitage', 'Côte-Rôtie', 'Estate'],
    'Malbec': ['Reserva', 'Gran Reserva', 'Estate'],
    'Zinfandel': ['Old Vine', 'Reserve', 'Estate'],
    'Sangiovese': ['Brunello', 'Riserva', 'Chianti Classico Riserva'],
    'Tempranillo': ['Reserva', 'Gran Reserva', 'Crianza'],
    'Grenache': ['Reserve', 'Châteauneuf-du-Pape', 'Estate'],
    'Nebbiolo': ['Barolo', 'Barbaresco', 'Riserva'],
    'Chardonnay': ['Reserve', 'Estate', 'Cuvée', 'Grand Cru', 'Premier Cru'],
    'Sauvignon Blanc': ['Reserve', 'Estate', 'Fumé Blanc'],
    'Riesling': ['Kabinett', 'Spätlese', 'Auslese', 'Reserve'],
    'Pinot Grigio': ['Reserve', 'Estate'],
    'Viognier': ['Reserve', 'Estate', 'Condrieu'],
    'Champagne': ['Brut', 'Blanc de Blancs', 'Blanc de Noirs', 'Rosé', 'Vintage', 'Prestige Cuvée'],
    'Sauternes Blend': ['Sauternes', 'Grand Vin'],
    'Muscat': ['Moscato d\'Asti', 'Muscat de Beaumes-de-Venise', 'Late Harvest'],
};

// Helper functions
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function randomPrice(min: number, max: number): number {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

async function main() {
    console.log('🌱 Starting seed...');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.photo.deleteMany();
    await prisma.wine.deleteMany();
    await prisma.winery.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.cellarLocation.deleteMany();

    // Create wineries
    console.log('🏛️  Creating 100 wineries...');
    const createdWineries = [];
    for (const wineryData of wineriesData) {
        const winery = await prisma.winery.create({
            data: wineryData,
        });
        createdWineries.push(winery);
    }
    console.log(`✅ Created ${createdWineries.length} wineries`);

    // Fetch all varietals from database
    console.log('🍇 Fetching varietals...');
    const allVarietals = await prisma.varietal.findMany();

    if (allVarietals.length === 0) {
        console.warn('⚠️  No varietals found in database. Please run seed-varietals.ts first!');
        console.warn('   Run: npx tsx prisma/seed-varietals.ts');
        process.exit(1);
    }

    // Group varietals by type for easier selection
    const varietalsByType = {
        RED: allVarietals.filter(v => v.type === 'RED'),
        WHITE: allVarietals.filter(v => v.type === 'WHITE'),
        ROSE: allVarietals.filter(v => v.type === 'ROSE'),
        SPARKLING: allVarietals.filter(v => v.type === 'SPARKLING'),
        DESSERT: allVarietals.filter(v => v.type === 'DESSERT'),
    };

    console.log(`✅ Found ${allVarietals.length} varietals`);
    console.log(`   RED: ${varietalsByType.RED.length}, WHITE: ${varietalsByType.WHITE.length}, DESSERT: ${varietalsByType.DESSERT.length}`);

    // Create some tags
    console.log('🏷️  Creating tags...');
    const tagNames = [
        'Favorite', 'Special Occasion', 'Ready to Drink', 'Needs Aging',
        'Gift', 'Everyday Drinking', 'Investment', 'Rare', 'Organic', 'Biodynamic'
    ];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

    const createdTags = [];
    for (let i = 0; i < tagNames.length; i++) {
        const tag = await prisma.tag.create({
            data: {
                name: tagNames[i],
                color: colors[i % colors.length],
            },
        });
        createdTags.push(tag);
    }
    console.log(`✅ Created ${createdTags.length} tags`);

    // Create cellar locations
    console.log('📍 Creating cellar locations...');
    const cellarLocations = [
        { name: 'Main Cellar - Rack A', temperature: '55°F', humidity: '70%', capacity: 100 },
        { name: 'Main Cellar - Rack B', temperature: '55°F', humidity: '70%', capacity: 100 },
        { name: 'Main Cellar - Rack C', temperature: '55°F', humidity: '70%', capacity: 100 },
        { name: 'Secondary Cellar', temperature: '56°F', humidity: '68%', capacity: 150 },
        { name: 'Wine Fridge - Kitchen', temperature: '54°F', humidity: '65%', capacity: 50 },
    ];

    for (const location of cellarLocations) {
        await prisma.cellarLocation.create({ data: location });
    }
    console.log(`✅ Created ${cellarLocations.length} cellar locations`);

    // Create 1000 wines
    console.log('🍷 Creating 1000 wines...');
    const wines = [];
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < 1000; i++) {
        const winery = randomElement(createdWineries);
        const type = randomElement(wineTypes);
        const vintage = type === 'SPARKLING' && Math.random() > 0.7
            ? null // Some NV sparkling
            : randomInt(1990, currentYear - 1);

        // Select appropriate varietal based on wine type
        let varietal = null;
        let varietalName = null;

        if (type === 'RED' && varietalsByType.RED.length > 0) {
            varietal = randomElement(varietalsByType.RED);
            varietalName = varietal.name;
        } else if (type === 'WHITE' && varietalsByType.WHITE.length > 0) {
            varietal = randomElement(varietalsByType.WHITE);
            varietalName = varietal.name;
        } else if (type === 'DESSERT' && varietalsByType.DESSERT.length > 0) {
            varietal = randomElement(varietalsByType.DESSERT);
            varietalName = varietal.name;
        } else if (type === 'SPARKLING') {
            // Sparkling can use Chardonnay or Pinot Noir base
            const sparklingVarietals = allVarietals.filter(v =>
                v.name === 'Chardonnay' || v.name === 'Pinot Noir'
            );
            if (sparklingVarietals.length > 0) {
                varietal = randomElement(sparklingVarietals);
                varietalName = 'Champagne'; // Use Champagne as the name for sparkling
            }
        }

        // Generate wine name based on varietal
        let wineName = varietalName || 'Estate Wine';
        const nameAdditions = wineNamesData[varietalName as keyof typeof wineNamesData];
        if (nameAdditions && Math.random() > 0.5) {
            wineName = `${randomElement(nameAdditions)} ${varietalName}`;
        }

        const name = vintage ? `${wineName} ${vintage}` : wineName;

        // Price ranges by type
        let minPrice = 15;
        let maxPrice = 150;
        if (type === 'SPARKLING' || type === 'DESSERT') {
            minPrice = 30;
            maxPrice = 300;
        }
        if (winery.country === 'France' && winery.region?.includes('Bordeaux')) {
            minPrice = 50;
            maxPrice = 500;
        }

        const purchasePrice = randomPrice(minPrice, maxPrice);
        const ageMultiplier = vintage ? 1 + ((currentYear - vintage) * 0.03) : 1;
        const currentValue = Math.round(purchasePrice * ageMultiplier * 100) / 100;

        // Drinking window
        const ageYears = vintage ? currentYear - vintage : 0;
        let drinkFrom = vintage ? vintage + randomInt(3, 8) : currentYear;
        let drinkTo = drinkFrom + randomInt(10, 25);

        // Determine status based on age
        let status = 'IN_CELLAR';
        if (drinkFrom <= currentYear && drinkTo >= currentYear) {
            status = Math.random() > 0.5 ? 'READY_TO_DRINK' : 'IN_CELLAR';
        } else if (drinkTo < currentYear) {
            status = Math.random() > 0.7 ? 'PAST_PEAK' : 'IN_CELLAR';
        }
        if (Math.random() > 0.95) {
            status = 'RESERVED';
        }

        // Select 0-3 random tags
        const numTags = randomInt(0, 3);
        const wineTags: Tags[] = [];
        for (let t = 0; t < numTags; t++) {
            const tag = randomElement(createdTags);
            if (!wineTags.find(wt => wt.id === tag.id)) {
                wineTags.push(tag);
            }
        }

        const wine = await prisma.wine.create({
            data: {
                name,
                wineryId: winery.id,
                vintage,
                varietalId: varietal?.id || null,
                region: winery.region,
                country: winery.country,
                type: type as any,
                sweetness: type === 'WHITE' || type === 'DESSERT'
                    ? randomElement(sweetness) as any
                    : type === 'RED' ? 'DRY' as any : null,
                quantity: randomInt(1, 6),
                bottleSize: Math.random() > 0.85 ? randomElement(bottleSizes) as any : 'STANDARD',
                purchaseDate: new Date(randomInt(2015, 2024), randomInt(0, 11), randomInt(1, 28)),
                purchasePrice,
                purchaseLocation: randomElement(['Wine Shop', 'Online', 'Winery Direct', 'Auction', 'Restaurant']),
                retailer: Math.random() > 0.5 ? randomElement(['K&L Wine', 'Wine.com', 'Total Wine', 'Local Wine Shop']) : null,
                location: randomElement(['Rack A', 'Rack B', 'Rack C', 'Wine Fridge', 'Secondary Cellar']),
                binNumber: `${randomInt(1, 20)}`,
                rackNumber: `${randomElement(['A', 'B', 'C'])}${randomInt(1, 10)}`,
                drinkFrom,
                drinkTo,
                peakDrinking: Math.floor((drinkFrom + drinkTo) / 2),
                personalRating: Math.random() > 0.3 ? randomInt(85, 98) : null,
                criticsRating: Math.random() > 0.4 ? randomInt(88, 100) : null,
                criticName: Math.random() > 0.5 ? randomElement(['Robert Parker', 'Wine Spectator', 'James Suckling', 'Jancis Robinson']) : null,
                personalNotes: Math.random() > 0.6 ? 'Excellent structure, needs more time to develop.' : null,
                tastingNotes: varietal?.characteristics?.slice(0, 3).join(', ') || 'Complex and well-balanced.',
                currentValue,
                estimatedValue: currentValue * randomPrice(0.95, 1.15),
                status: status as any,
                tags: {
                    connect: wineTags.map(tag => ({ id: tag.id })),
                },
            },
        });

        wines.push(wine);

        // Progress indicator
        if ((i + 1) % 100 === 0) {
            console.log(`   Created ${i + 1}/1000 wines...`);
        }
    }

    console.log(`✅ Created ${wines.length} wines`);

    // Summary statistics
    const stats = await prisma.wine.groupBy({
        by: ['type'],
        _count: { id: true },
    });

    console.log('\n📊 Summary:');
    console.log(`   Total wineries: ${createdWineries.length}`);
    console.log(`   Total varietals: ${allVarietals.length}`);
    console.log(`   Total wines: ${wines.length}`);
    console.log('   Wines by type:');
    stats.forEach(stat => {
        console.log(`      ${stat.type}: ${stat._count.id}`);
    });

    // Count wines by varietal
    const varietalStats = await prisma.wine.groupBy({
        by: ['varietalId'],
        _count: { id: true },
        where: {
            varietalId: { not: null }
        }
    });

    console.log('   Top 10 varietals:');

    // Get varietal names for the stats
    const varietalStatsWithNames = await Promise.all(
        varietalStats.map(async (stat) => {
            if (stat.varietalId) {
                const varietalInfo = await prisma.varietal.findUnique({
                    where: { id: stat.varietalId }
                });
                return {
                    name: varietalInfo?.name || 'Unknown',
                    count: stat._count.id
                };
            }
            return null;
        })
    );

    varietalStatsWithNames
        .filter(stat => stat !== null)
        .sort((a, b) => b!.count - a!.count)
        .slice(0, 10)
        .forEach(stat => {
            if (stat) {
                console.log(`      ${stat.name}: ${stat.count}`);
            }
        });

    const totalValue = wines.reduce((sum, wine) => {
        const value = wine.currentValue ? parseFloat(wine.currentValue.toString()) : 0;
        return sum + (value * wine.quantity);
    }, 0);

    console.log(`   Total collection value: $${totalValue.toFixed(2)}`);
    console.log('\n✨ Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });