"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripsService = void 0;
const database_1 = require("../../config/database");
const response_utils_1 = require("../../shared/utils/response.utils");
const socket_1 = require("../../config/socket");
const ses_utils_1 = require("../../shared/utils/ses.utils");
const sqs_utils_1 = require("../../shared/utils/sqs.utils");
const google_places_utils_1 = require("../../shared/utils/google-places.utils");
class TripsService {
    static async getAll(userId, query) {
        const { status, page = 1, limit = 10 } = query;
        const where = { userId };
        if (status)
            where.status = status;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const [trips, total] = await Promise.all([
            database_1.prisma.trip.findMany({
                where,
                include: { destination: true },
                orderBy: { startDate: 'asc' },
                skip,
                take,
            }),
            database_1.prisma.trip.count({ where }),
        ]);
        return {
            data: trips,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            }
        };
    }
    static async create(userId, data) {
        const trip = await database_1.prisma.trip.create({
            data: {
                title: data.title,
                destinationId: data.destinationId,
                startDate: data.startDate,
                endDate: data.endDate,
                totalBudget: Number(data.totalBudget) || 0,
                currency: data.currency || 'INR',
                groupSize: data.groupSize || 1,
                travelStyle: data.travelStyle || 'General',
                notes: data.notes,
                coverImage: data.coverImage,
                userId,
                budget: {
                    create: {
                        totalAmount: Number(data.totalBudget) || 0,
                        currency: data.currency || 'INR',
                        userId,
                    },
                },
            },
            include: { destination: true }
        });
        // Send async confirmation email
        database_1.prisma.user.findUnique({ where: { id: userId } }).then(user => {
            if (user) {
                (0, ses_utils_1.sendTripConfirmation)(user.email, user.name, {
                    title: trip.title,
                    destination: trip.destination.name,
                    startDate: trip.startDate.toDateString(),
                    endDate: trip.endDate.toDateString(),
                    totalBudget: trip.totalBudget,
                    currency: trip.currency
                });
            }
        });
        return trip;
    }
    static async saveGeneratedTrip(userId, data) {
        const duration = data.days || 3;
        const rawAiBudget = String(data.itineraryData?.totalEstimatedCost || '').replace(/[^0-9.]/g, '');
        const aiBudget = parseFloat(rawAiBudget);
        const totalBudget = (!isNaN(aiBudget) && aiBudget > 0) ? aiBudget : (Number(data.totalBudget) || 0);
        const destName = data.destination || data.itineraryData?.destination || "Unknown Destination";
        // Step 1: Find or Create Destination (Prevent FK violation)
        let destination = await database_1.prisma.destination.findFirst({
            where: { name: { contains: destName.split(',')[0], mode: 'insensitive' } }
        });
        if (!destination) {
            destination = await database_1.prisma.destination.create({
                data: {
                    name: destName,
                    country: destName.split(',').slice(-1)[0]?.trim() || 'Unknown',
                    continent: 'Discovery',
                    description: `Custom planned trip to ${destName}`,
                    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
                    avgCostPerDay: totalBudget / duration,
                    latitude: 0,
                    longitude: 0,
                    tags: ['Custom'],
                }
            });
        }
        // Step 2: Dynamic Budget Extraction Logic
        let flightCost = 0;
        if (data.itineraryData?.flights && Array.isArray(data.itineraryData.flights)) {
            flightCost = data.itineraryData.flights.reduce((acc, f) => {
                let p = String(f.price || "0").replace(/[^0-9]/g, '');
                return acc + (parseInt(p) || 0);
            }, 0);
        }
        let hotelCost = 0;
        if (data.itineraryData?.hotels && Array.isArray(data.itineraryData.hotels) && data.itineraryData.hotels.length > 0) {
            let p = String(data.itineraryData.hotels[0].price || "0").replace(/[^0-9]/g, '');
            hotelCost = (parseInt(p) || 0) * Math.max(1, duration - 1);
        }
        let actCost = 0;
        if (data.itineraryData?.days && Array.isArray(data.itineraryData.days)) {
            data.itineraryData.days.forEach((d) => {
                ['morning', 'afternoon', 'evening'].forEach(slot => {
                    if (d[slot] && d[slot].cost) {
                        let p = String(d[slot].cost).replace(/[^0-9]/g, '');
                        actCost += (parseInt(p) || 0);
                    }
                });
            });
        }
        let totalExtracted = flightCost + hotelCost + actCost;
        // Assign remaining budget to food, minimum 15% of total Budget
        let foodCost = Math.max(Math.round(totalBudget * 0.15), totalBudget - totalExtracted);
        // Fallback if data extraction completely fails, otherwise use extracted
        let breakdown = {
            stay: hotelCost > 0 ? hotelCost : Math.round(totalBudget * 0.40),
            food: foodCost > 0 ? foodCost : Math.round(totalBudget * 0.20),
            travel: flightCost > 0 ? flightCost : Math.round(totalBudget * 0.20),
            activities: actCost > 0 ? actCost : Math.round(totalBudget * 0.20)
        };
        const trip = await database_1.prisma.trip.create({
            data: {
                title: data.title || `Trip to ${destName}`,
                destinationId: destination.id,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                totalBudget,
                travelStyle: data.travelStyle || 'General',
                duration,
                userId,
                itineraryData: data.itineraryData || {},
                hotelData: data.hotelData || {},
                budgetBreakdown: breakdown,
                budget: {
                    create: {
                        totalAmount: totalBudget,
                        currency: data.currency || 'INR',
                        userId,
                        expenses: {
                            create: [
                                { category: 'HOTELS', description: 'Budget for Stay', amount: breakdown.stay, date: new Date(data.startDate) },
                                { category: 'FOOD', description: 'Budget for Food', amount: breakdown.food, date: new Date(data.startDate) },
                                { category: 'TRANSPORT', description: 'Budget for Travel', amount: breakdown.travel, date: new Date(data.startDate) },
                                { category: 'ACTIVITIES', description: 'Budget for Activities', amount: breakdown.activities, date: new Date(data.startDate) },
                            ]
                        }
                    },
                },
            },
            include: { destination: true }
        });
        // Enrichment: Fetch and save images for each place in the itinerary
        await this.enrichTripWithImages(trip.id, data.itineraryData);
        // If we have a legacy itinerary ID or need to create one, handle it
        if (data.itineraryData && !trip.itineraryId) {
            try {
                const ItineraryModel = (await Promise.resolve().then(() => __importStar(require('../itinerary/itinerary.model')))).default;
                const itinerary = await ItineraryModel.create({
                    tripId: trip.id,
                    userId,
                    destination: data.destination,
                    duration,
                    days: data.itineraryData.days || [],
                    flights: data.itineraryData.flights || [],
                    hotels: data.itineraryData.hotels || [],
                    totalEstimatedCost: totalBudget,
                    currency: 'INR',
                });
                await database_1.prisma.trip.update({
                    where: { id: trip.id },
                    data: { itineraryId: itinerary._id.toString() },
                });
            }
            catch (err) {
                console.error('Failed to save to MongoDB, but Postgres record is safe:', err);
            }
        }
        // Fire-and-forget: send notification via SQS → Lambda → SES
        database_1.prisma.user.findUnique({ where: { id: userId } }).then(async (user) => {
            if (user) {
                await (0, sqs_utils_1.sendMessageToQueue)({
                    type: "EMAIL",
                    to: user.email,
                    subject: `Trip Confirmed ✈️ — ${trip.title}`,
                    message: `Hi ${user.name},\n\n` +
                        `Your trip to ${trip.destination.name} has been successfully planned!\n\n` +
                        `Dates: ${trip.startDate.toDateString()} → ${trip.endDate.toDateString()}\n` +
                        `Budget: ${trip.currency} ${trip.totalBudget.toLocaleString()}\n\n` +
                        `Open TravelNest to view your full itinerary.\n\nSafe travels! 🌍`,
                });
            }
        }).catch((err) => {
            console.error('[SQS] Failed to dispatch trip notification:', err);
        });
        return trip;
    }
    static async getById(userId, id) {
        const trip = await database_1.prisma.trip.findUnique({
            where: { id },
            include: {
                destination: true,
                bookings: true,
                budget: { include: { expenses: true } },
                documents: true,
                itineraryPlaces: true,
            },
        });
        if (!trip || trip.userId !== userId) {
            throw new response_utils_1.AppError('Trip not found or unauthorized', 404);
        }
        return trip;
    }
    static async update(userId, id, data) {
        const trip = await database_1.prisma.trip.findUnique({ where: { id } });
        if (!trip || trip.userId !== userId) {
            throw new response_utils_1.AppError('Trip not found or unauthorized', 404);
        }
        const updatedTrip = await database_1.prisma.trip.update({
            where: { id },
            data,
        });
        if (data.status && data.status !== trip.status) {
            socket_1.io.to(`trip:${id}`).emit('trip:updated', { trip: updatedTrip });
        }
        return updatedTrip;
    }
    static async delete(userId, id) {
        const trip = await database_1.prisma.trip.findUnique({ where: { id } });
        if (!trip || trip.userId !== userId) {
            throw new response_utils_1.AppError('Trip not found or unauthorized', 404);
        }
        // Cascade delete other resources if not handled by DB
        // Prisma handles cascade in schema.prisma for bookings, budget, alerts
        await database_1.prisma.trip.delete({ where: { id } });
    }
    static async updateStatus(userId, id, status) {
        return this.update(userId, id, { status });
    }
    /**
     * Internal helper to enrich a trip with images for its itinerary places.
     * Extracts names, fetches from Google, and stores in Postgres.
     */
    static async enrichTripWithImages(tripId, itineraryData) {
        if (!itineraryData)
            return;
        try {
            const destName = itineraryData.destination || "Destination";
            const gallery = await (0, google_places_utils_1.getItineraryGallery)(destName, itineraryData);
            for (const item of gallery) {
                await database_1.prisma.itineraryPlace.create({
                    data: {
                        tripId,
                        name: item.name,
                        imageUrl: item.url,
                    },
                });
            }
        }
        catch (err) {
            console.error(`Failed to enrich trip gallery for trip ${tripId}:`, err);
        }
    }
}
exports.TripsService = TripsService;
//# sourceMappingURL=trips.service.js.map