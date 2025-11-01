// prisma/seed-varietals.ts

import { PrismaClient, WineType } from '@prisma/client';

const prisma = new PrismaClient();

const varietals = [
    // RED VARIETALS
    {
        name: 'Cabernet Sauvignon',
        type: WineType.RED,
        description: 'A full-bodied red wine known for its dark fruit flavors, firm tannins, and excellent aging potential.',
        commonRegions: ['Bordeaux', 'Napa Valley', 'Coonawarra', 'Maipo Valley'],
        characteristics: ['Full-bodied', 'High tannins', 'Blackcurrant', 'Cedar', 'Ages well'],
        aliases: ['Cab Sauv', 'Cabernet'],
    },
    {
        name: 'Pinot Noir',
        type: WineType.RED,
        description: 'An elegant, lighter-bodied red wine with delicate flavors and silky tannins.',
        commonRegions: ['Burgundy', 'Willamette Valley', 'Central Otago', 'Sonoma Coast'],
        characteristics: ['Light to medium-bodied', 'Low tannins', 'Red fruit', 'Earthy', 'Silky texture'],
        aliases: ['Pinot'],
    },
    {
        name: 'Merlot',
        type: WineType.RED,
        description: 'A soft, fruit-forward red wine with velvety texture and approachable tannins.',
        commonRegions: ['Bordeaux', 'Pomerol', 'Napa Valley', 'Tuscany'],
        characteristics: ['Medium-bodied', 'Soft tannins', 'Plum', 'Cherry', 'Smooth'],
        aliases: [],
    },
    {
        name: 'Syrah',
        type: WineType.RED,
        description: 'A bold red wine with dark fruit flavors, pepper notes, and powerful structure.',
        commonRegions: ['Rhône Valley', 'Barossa Valley', 'Paso Robles', 'Hawke\'s Bay'],
        characteristics: ['Full-bodied', 'High tannins', 'Blackberry', 'Pepper', 'Smoky'],
        aliases: ['Shiraz'],
    },
    {
        name: 'Malbec',
        type: WineType.RED,
        description: 'A rich, dark wine known for its inky color, ripe fruit flavors, and smooth finish.',
        commonRegions: ['Mendoza', 'Cahors', 'Salta'],
        characteristics: ['Full-bodied', 'Medium tannins', 'Plum', 'Blackberry', 'Cocoa'],
        aliases: ['Cot', 'Auxerrois'],
    },
    {
        name: 'Zinfandel',
        type: WineType.RED,
        description: 'A bold, fruit-forward wine with jammy flavors and high alcohol content.',
        commonRegions: ['California', 'Lodi', 'Paso Robles', 'Sonoma'],
        characteristics: ['Full-bodied', 'Medium-high tannins', 'Jammy', 'Spicy', 'High alcohol'],
        aliases: ['Zin', 'Primitivo'],
    },
    {
        name: 'Sangiovese',
        type: WineType.RED,
        description: 'An Italian varietal with bright acidity, cherry flavors, and herbal notes.',
        commonRegions: ['Tuscany', 'Chianti', 'Montalcino', 'Montepulciano'],
        characteristics: ['Medium-bodied', 'High acidity', 'Cherry', 'Herbal', 'Earthy'],
        aliases: ['Brunello', 'Prugnolo Gentile'],
    },
    {
        name: 'Tempranillo',
        type: WineType.RED,
        description: 'Spain\'s noble grape producing wines with red fruit flavors and savory notes.',
        commonRegions: ['Rioja', 'Ribera del Duero', 'Toro', 'Priorat'],
        characteristics: ['Medium to full-bodied', 'Medium tannins', 'Cherry', 'Leather', 'Tobacco'],
        aliases: ['Tinto Fino', 'Tinta del Pais', 'Cencibel'],
    },
    {
        name: 'Grenache',
        type: WineType.RED,
        description: 'A fruity, spicy wine often used in blends, especially in the Southern Rhône.',
        commonRegions: ['Rhône Valley', 'Priorat', 'McLaren Vale', 'Languedoc'],
        characteristics: ['Medium to full-bodied', 'Low tannins', 'Red fruit', 'Spicy', 'High alcohol'],
        aliases: ['Garnacha', 'Cannonau'],
    },
    {
        name: 'Nebbiolo',
        type: WineType.RED,
        description: 'A powerful Italian wine with high tannins, acidity, and exceptional aging potential.',
        commonRegions: ['Barolo', 'Barbaresco', 'Piedmont', 'Langhe'],
        characteristics: ['Full-bodied', 'Very high tannins', 'High acidity', 'Rose', 'Tar', 'Ages exceptionally'],
        aliases: ['Spanna', 'Chiavennasca'],
    },
    {
        name: 'Cabernet Franc',
        type: WineType.RED,
        description: 'A medium-bodied red with herbaceous notes and softer tannins than Cabernet Sauvignon.',
        commonRegions: ['Loire Valley', 'Bordeaux', 'Finger Lakes', 'Friuli'],
        characteristics: ['Medium-bodied', 'Medium tannins', 'Red fruit', 'Herbaceous', 'Violet'],
        aliases: ['Cab Franc'],
    },
    {
        name: 'Petit Verdot',
        type: WineType.RED,
        description: 'A tannic, full-bodied wine often used as a blending grape in Bordeaux.',
        commonRegions: ['Bordeaux', 'Napa Valley', 'Australia'],
        characteristics: ['Full-bodied', 'Very high tannins', 'Dark fruit', 'Floral', 'Violet'],
        aliases: [],
    },

    // WHITE VARIETALS
    {
        name: 'Chardonnay',
        type: WineType.WHITE,
        description: 'A versatile white wine ranging from crisp and mineral to rich and buttery.',
        commonRegions: ['Burgundy', 'California', 'Australia', 'Chablis'],
        characteristics: ['Medium to full-bodied', 'Apple', 'Citrus', 'Butter (oaked)', 'Versatile'],
        aliases: ['Chard'],
    },
    {
        name: 'Sauvignon Blanc',
        type: WineType.WHITE,
        description: 'A crisp, aromatic white wine with bright acidity and herbaceous notes.',
        commonRegions: ['Sancerre', 'Marlborough', 'Napa Valley', 'Bordeaux'],
        characteristics: ['Light to medium-bodied', 'High acidity', 'Citrus', 'Gooseberry', 'Grassy'],
        aliases: ['Sauv Blanc', 'Fumé Blanc'],
    },
    {
        name: 'Riesling',
        type: WineType.WHITE,
        description: 'An aromatic white wine ranging from bone dry to lusciously sweet with vibrant acidity.',
        commonRegions: ['Mosel', 'Alsace', 'Finger Lakes', 'Clare Valley'],
        characteristics: ['Light to medium-bodied', 'High acidity', 'Floral', 'Petrol', 'Stone fruit', 'Age-worthy'],
        aliases: [],
    },
    {
        name: 'Pinot Grigio',
        type: WineType.WHITE,
        description: 'A light, crisp white wine with refreshing acidity and subtle fruit flavors.',
        commonRegions: ['Friuli', 'Trentino-Alto Adige', 'Veneto', 'Oregon'],
        characteristics: ['Light-bodied', 'High acidity', 'Citrus', 'Green apple', 'Crisp'],
        aliases: ['Pinot Gris'],
    },
    {
        name: 'Viognier',
        type: WineType.WHITE,
        description: 'An aromatic white wine with floral notes, stone fruit, and full body.',
        commonRegions: ['Condrieu', 'Rhône Valley', 'California', 'Australia'],
        characteristics: ['Full-bodied', 'Low acidity', 'Peach', 'Apricot', 'Floral', 'Oily texture'],
        aliases: [],
    },
    {
        name: 'Gewürztraminer',
        type: WineType.WHITE,
        description: 'A highly aromatic white wine with exotic spice and lychee flavors.',
        commonRegions: ['Alsace', 'Germany', 'Marlborough', 'Finger Lakes'],
        characteristics: ['Medium to full-bodied', 'Low acidity', 'Lychee', 'Rose', 'Spicy', 'Aromatic'],
        aliases: ['Gewurz'],
    },
    {
        name: 'Chenin Blanc',
        type: WineType.WHITE,
        description: 'A versatile white wine with high acidity, ranging from dry to sweet.',
        commonRegions: ['Loire Valley', 'South Africa', 'California'],
        characteristics: ['Medium-bodied', 'High acidity', 'Apple', 'Honey', 'Floral', 'Versatile'],
        aliases: ['Steen'],
    },
    {
        name: 'Albariño',
        type: WineType.WHITE,
        description: 'A crisp Spanish white wine with citrus flavors and stone fruit notes.',
        commonRegions: ['Rías Baixas', 'Vinho Verde'],
        characteristics: ['Light to medium-bodied', 'High acidity', 'Citrus', 'Peach', 'Saline', 'Refreshing'],
        aliases: ['Alvarinho'],
    },
    {
        name: 'Grüner Veltliner',
        type: WineType.WHITE,
        description: 'Austria\'s signature white wine with peppery notes and citrus flavors.',
        commonRegions: ['Wachau', 'Kremstal', 'Kamptal'],
        characteristics: ['Light to medium-bodied', 'High acidity', 'Citrus', 'White pepper', 'Mineral'],
        aliases: ['Gruner', 'GruVe'],
    },
    {
        name: 'Vermentino',
        type: WineType.WHITE,
        description: 'A Mediterranean white wine with citrus and herbal notes.',
        commonRegions: ['Sardinia', 'Liguria', 'Tuscany', 'Corsica'],
        characteristics: ['Light to medium-bodied', 'High acidity', 'Citrus', 'Herbal', 'Saline', 'Crisp'],
        aliases: ['Rolle'],
    },
    {
        name: 'Sémillon',
        type: WineType.WHITE,
        description: 'A full-bodied white wine often blended with Sauvignon Blanc.',
        commonRegions: ['Bordeaux', 'Hunter Valley', 'Sauternes'],
        characteristics: ['Medium to full-bodied', 'Low acidity', 'Citrus', 'Waxy', 'Ages well'],
        aliases: ['Semillon'],
    },

    // ROSÉ & SPARKLING
    {
        name: 'Mourvèdre',
        type: WineType.RED,
        description: 'A full-bodied red often used in blends and rosé production.',
        commonRegions: ['Bandol', 'Rhône Valley', 'Spain'],
        characteristics: ['Full-bodied', 'High tannins', 'Gamey', 'Earthy', 'Spicy'],
        aliases: ['Monastrell', 'Mataro'],
    },
    {
        name: 'Cinsault',
        type: WineType.RED,
        description: 'A light red wine often used for rosé production.',
        commonRegions: ['Rhône Valley', 'Provence', 'South Africa'],
        characteristics: ['Light to medium-bodied', 'Low tannins', 'Red fruit', 'Floral', 'Refreshing'],
        aliases: ['Cinsaut'],
    },

    // DESSERT/FORTIFIED
    {
        name: 'Muscat',
        type: WineType.DESSERT,
        description: 'An aromatic grape used for both dry and sweet wines with distinctive floral notes.',
        commonRegions: ['Alsace', 'Beaumes-de-Venise', 'Rutherglen', 'Piedmont'],
        characteristics: ['Aromatic', 'Floral', 'Grape', 'Orange blossom', 'Sweet'],
        aliases: ['Moscato', 'Moscatel', 'Muscat Blanc'],
    },
    {
        name: 'Sauternes Blend',
        type: WineType.DESSERT,
        description: 'A blend typically featuring Sémillon, Sauvignon Blanc, and Muscadelle affected by noble rot.',
        commonRegions: ['Sauternes', 'Barsac'],
        characteristics: ['Full-bodied', 'Sweet', 'Honey', 'Apricot', 'Botrytis'],
        aliases: [],
    },
];

async function seedVarietals() {
    console.log('Seeding varietals...');

    for (const varietalData of varietals) {
        await prisma.varietal.upsert({
            where: { name: varietalData.name },
            update: varietalData,
            create: varietalData,
        });
        console.log(`✓ ${varietalData.name}`);
    }

    console.log(`\n✅ Seeded ${varietals.length} varietals successfully!`);
}

seedVarietals()
    .catch((e) => {
        console.error('Error seeding varietals:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });