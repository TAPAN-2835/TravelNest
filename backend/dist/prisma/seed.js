"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const passwordHash = await bcryptjs_1.default.hash('password123', 12);
    // 1. Admin User
    await prisma.user.upsert({
        where: { email: 'admin@travelnest.com' },
        update: {},
        create: {
            email: 'admin@travelnest.com',
            name: 'TravelNest Admin',
            passwordHash,
            role: 'ADMIN',
        },
    });
    const destinationsData = [
        {
            name: 'Kyoto', country: 'Japan', continent: 'Asia',
            description: 'Ancient temples, tea houses, and cherry blossoms in the cultural heart of Japan.',
            imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
            avgCostPerDay: 8000, bestSeason: ['Spring', 'Autumn'],
            tags: ['Culture', 'History', 'Nature'], latitude: 35.0116, longitude: 135.7681,
            rating: 4.8, reviewCount: 0,
        },
        {
            name: 'Santorini', country: 'Greece', continent: 'Europe',
            description: 'Iconic blue-domed churches and breathtaking caldera sunsets.',
            imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
            avgCostPerDay: 15000, bestSeason: ['Summer', 'Late Spring'],
            tags: ['Romantic', 'Luxury', 'Beach'], latitude: 36.3932, longitude: 25.4615,
            rating: 4.9, reviewCount: 0,
        },
        {
            name: 'Goa', country: 'India', continent: 'Asia',
            description: 'Golden beaches, vibrant nightlife and colonial Portuguese architecture.',
            imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800',
            avgCostPerDay: 3500, bestSeason: ['Winter', 'Autumn'],
            tags: ['Beach', 'Nightlife', 'Budget'], latitude: 15.2993, longitude: 74.1240,
            rating: 4.5, reviewCount: 0,
        },
        {
            name: 'Manali', country: 'India', continent: 'Asia',
            description: 'Snow-capped mountains, river valleys and thrilling adventure sports.',
            imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
            avgCostPerDay: 2500, bestSeason: ['Summer', 'Winter'],
            tags: ['Adventure', 'Mountains', 'Budget'], latitude: 32.2432, longitude: 77.1892,
            rating: 4.6, reviewCount: 0,
        },
        {
            name: 'Jaipur', country: 'India', continent: 'Asia',
            description: 'The Pink City — majestic forts, royal palaces and vibrant bazaars.',
            imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800',
            avgCostPerDay: 2800, bestSeason: ['Winter', 'Autumn'],
            tags: ['Culture', 'History', 'Heritage'], latitude: 26.9124, longitude: 75.7873,
            rating: 4.7, reviewCount: 0,
        },
        {
            name: 'Bali', country: 'Indonesia', continent: 'Asia',
            description: 'Tropical paradise with rice terraces, temples and world-class surf.',
            imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
            avgCostPerDay: 4500, bestSeason: ['Summer', 'Spring'],
            tags: ['Beach', 'Culture', 'Wellness'], latitude: -8.3405, longitude: 115.0920,
            rating: 4.8, reviewCount: 0,
        },
        {
            name: 'Dubai', country: 'UAE', continent: 'Asia',
            description: 'Futuristic skyline, luxury malls, desert safaris and 5-star experiences.',
            imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
            avgCostPerDay: 20000, bestSeason: ['Winter', 'Autumn'],
            tags: ['Luxury', 'Shopping', 'Modern'], latitude: 25.2048, longitude: 55.2708,
            rating: 4.7, reviewCount: 0,
        },
        {
            name: 'Paris', country: 'France', continent: 'Europe',
            description: 'The City of Light — art, fashion, cuisine and the Eiffel Tower.',
            imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
            avgCostPerDay: 18000, bestSeason: ['Spring', 'Summer'],
            tags: ['Romantic', 'Culture', 'Art'], latitude: 48.8566, longitude: 2.3522,
            rating: 4.8, reviewCount: 0,
        },
        {
            name: 'Maldives', country: 'Maldives', continent: 'Asia',
            description: 'Overwater bungalows, crystal-clear lagoons and pristine coral reefs.',
            imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
            avgCostPerDay: 35000, bestSeason: ['Winter', 'Spring'],
            tags: ['Luxury', 'Beach', 'Romantic'], latitude: 3.2028, longitude: 73.2207,
            rating: 4.9, reviewCount: 0,
        },
        {
            name: 'Kerala', country: 'India', continent: 'Asia',
            description: 'Serene backwaters, lush tea gardens, Ayurveda and elephant sanctuaries.',
            imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
            avgCostPerDay: 3000, bestSeason: ['Winter', 'Autumn'],
            tags: ['Nature', 'Wellness', 'Budget'], latitude: 10.8505, longitude: 76.2711,
            rating: 4.7, reviewCount: 0,
        },
        {
            name: 'New York', country: 'USA', continent: 'Americas',
            description: 'The city that never sleeps — Times Square, Central Park and world culture.',
            imageUrl: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800',
            avgCostPerDay: 22000, bestSeason: ['Spring', 'Autumn'],
            tags: ['Urban', 'Culture', 'Shopping'], latitude: 40.7128, longitude: -74.0060,
            rating: 4.6, reviewCount: 0,
        },
        {
            name: 'Rishikesh', country: 'India', continent: 'Asia',
            description: 'Yoga capital of the world — rafting, trekking and Himalayan spirituality.',
            imageUrl: 'https://images.unsplash.com/photo-1544556601-a23d96d9a67c?w=800',
            avgCostPerDay: 2000, bestSeason: ['Winter', 'Spring'],
            tags: ['Adventure', 'Spiritual', 'Budget'], latitude: 30.0869, longitude: 78.2676,
            rating: 4.5, reviewCount: 0,
        },
        {
            name: 'Gujarat', country: 'India', continent: 'Asia',
            description: 'Land of diverse landscapes — salt deserts, wildlife sanctuaries, and ancient heritage.',
            imageUrl: 'https://images.unsplash.com/photo-1594632420427-463832ca831c?w=800',
            avgCostPerDay: 3000, bestSeason: ['Winter', 'Autumn'],
            tags: ['Culture', 'Heritage', 'Wildlife'], latitude: 22.2587, longitude: 71.1924,
            rating: 4.7, reviewCount: 0,
        },
    ];
    for (const dest of destinationsData) {
        const existing = await prisma.destination.findFirst({
            where: { name: dest.name }
        });
        if (!existing) {
            await prisma.destination.create({ data: dest });
            console.log(`Seeded destination: ${dest.name}`);
        }
    }
    // Sample user 1
    const user1 = await prisma.user.upsert({
        where: { email: 'rahul@example.com' },
        update: {},
        create: {
            email: 'rahul@example.com',
            name: 'Rahul Sharma',
            passwordHash,
            travelStyle: ['Adventure', 'Budget'],
            nationality: 'Indian',
        },
    });
    const goaDest = await prisma.destination.findFirst({
        where: { name: 'Goa' }
    });
    if (goaDest) {
        const trip1 = await prisma.trip.create({
            data: {
                userId: user1.id,
                destinationId: goaDest.id,
                title: 'Goa Beach Getaway',
                startDate: new Date('2026-05-01'),
                endDate: new Date('2026-05-06'),
                status: 'PLANNING',
                totalBudget: 25000,
                currency: 'INR',
                groupSize: 2,
                travelStyle: 'Budget',
                budget: {
                    create: {
                        userId: user1.id,
                        totalAmount: 25000,
                        currency: 'INR',
                        expenses: {
                            create: [
                                { category: 'FLIGHTS', description: 'IndiGo BLR-GOI', amount: 6000, date: new Date('2026-04-28') },
                                { category: 'HOTELS', description: 'Zostel Goa', amount: 8000, date: new Date('2026-05-01') },
                                { category: 'FOOD', description: 'Beach shacks and local food', amount: 3000, date: new Date('2026-05-02') },
                                { category: 'ACTIVITIES', description: 'Water sports package', amount: 2500, date: new Date('2026-05-03') },
                            ]
                        }
                    }
                }
            }
        });
        console.log(`Seeded trip for ${user1.name}`);
    }
    console.log('Seeding completed.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map