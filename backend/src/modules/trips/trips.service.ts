import { prisma } from '../../config/database';
import { AppError } from '../../shared/utils/response.utils';
import { io } from '../../config/socket';
import { sendTripConfirmation } from '../../shared/utils/ses.utils';

export class TripsService {
  static async getAll(userId: string, query: any) {
    const { status, page = 1, limit = 10 } = query;
    const where: any = { userId };
    if (status) where.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        include: { destination: true },
        orderBy: { startDate: 'asc' },
        skip,
        take,
      }),
      prisma.trip.count({ where }),
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

  static async create(userId: string, data: any) {
    const trip = await prisma.trip.create({
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
    prisma.user.findUnique({ where: { id: userId } }).then(user => {
      if (user) {
        sendTripConfirmation(user.email, user.name, {
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

  static async saveGeneratedTrip(userId: string, data: any) {
    const duration = data.days || 3;
    const totalBudget = Number(data.totalBudget) || 0;
    const destName = data.destination || data.itineraryData?.destination || "Unknown Destination";

    // Step 1: Find or Create Destination (Prevent FK violation)
    let destination = await prisma.destination.findFirst({
      where: { name: { contains: destName.split(',')[0], mode: 'insensitive' } }
    });

    if (!destination) {
      destination = await prisma.destination.create({
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

    // Step 2: Auto Budget Distribution Logic (40/20/20/20)
    const breakdown = {
      stay: Math.round(totalBudget * 0.40),
      food: Math.round(totalBudget * 0.20),
      travel: Math.round(totalBudget * 0.20),
      activities: Math.round(totalBudget * 0.20)
    };

    const trip = await prisma.trip.create({
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
                { category: 'HOTELS', description: 'Budget for Stay (Auto-allocated)', amount: breakdown.stay, date: new Date(data.startDate) },
                { category: 'FOOD', description: 'Budget for Food (Auto-allocated)', amount: breakdown.food, date: new Date(data.startDate) },
                { category: 'TRANSPORT', description: 'Budget for Travel (Auto-allocated)', amount: breakdown.travel, date: new Date(data.startDate) },
                { category: 'ACTIVITIES', description: 'Budget for Activities (Auto-allocated)', amount: breakdown.activities, date: new Date(data.startDate) },
              ]
            }
          },
        },
      },
      include: { destination: true }
    });

    // If we have a legacy itinerary ID or need to create one, handle it
    if (data.itineraryData && !trip.itineraryId) {
       try {
          const ItineraryModel = (await import('../itinerary/itinerary.model')).default;
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
          await prisma.trip.update({
            where: { id: trip.id },
            data: { itineraryId: (itinerary as any)._id.toString() },
          });
       } catch (err) {
          console.error('Failed to save to MongoDB, but Postgres record is safe:', err);
       }
    }

    // Send async confirmation email
    prisma.user.findUnique({ where: { id: userId } }).then(user => {
      if (user) {
        sendTripConfirmation(user.email, user.name, {
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

  static async getById(userId: string, id: string) {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        destination: true,
        bookings: true,
        budget: { include: { expenses: true } },
        documents: true,
      },
    });

    if (!trip || trip.userId !== userId) {
      throw new AppError('Trip not found or unauthorized', 404);
    }

    return trip;
  }

  static async update(userId: string, id: string, data: any) {
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip || trip.userId !== userId) {
      throw new AppError('Trip not found or unauthorized', 404);
    }

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data,
    });

    if (data.status && data.status !== trip.status) {
      io.to(`trip:${id}`).emit('trip:updated', { trip: updatedTrip });
    }

    return updatedTrip;
  }

  static async delete(userId: string, id: string) {
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip || trip.userId !== userId) {
      throw new AppError('Trip not found or unauthorized', 404);
    }

    // Cascade delete other resources if not handled by DB
    // Prisma handles cascade in schema.prisma for bookings, budget, alerts
    await prisma.trip.delete({ where: { id } });
  }

  static async updateStatus(userId: string, id: string, status: string) {
    return this.update(userId, id, { status });
  }
}
