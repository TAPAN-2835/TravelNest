const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const prisma = new PrismaClient();

async function checkItineraryPlaces() {
    console.log("Fetching ItineraryPlaces...");
    try {
        const places = await prisma.itineraryPlace.findMany({
            take: 10,
            include: { trip: true }
        });
        
        if (places.length === 0) {
            console.log("No ItineraryPlaces found in database.");
            return;
        }

        places.forEach(p => {
            console.log(`\nTrip: ${p.trip.title} (ID: ${p.tripId})`);
            console.log(`Place Name: ${p.name}`);
            console.log(`Image URL: ${p.imageUrl ? p.imageUrl.substring(0, 100) + "..." : "NULL"}`);
        });
    } catch (err) {
        console.error("Error querying database:", err.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkItineraryPlaces();
