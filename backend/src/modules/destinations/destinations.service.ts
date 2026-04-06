import { prisma } from '../../config/database';
import { getCachedData, setCachedData, invalidateCache } from '../../shared/utils/cache.utils';
import { getSkipLimit, getPaginationData } from '../../shared/utils/pagination.utils';

export class DestinationsService {
  static async getAll(query: any) {
    const { page = 1, limit = 10, search, country, continent, minCost, maxCost, season, tags } = query;
    const cacheKey = `destinations:all:${JSON.stringify(query)}`;
    
    const cached = await getCachedData(cacheKey);
    if (cached) return cached;

    const where: any = { isActive: true };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (country) where.country = country;
    if (continent) where.continent = continent;
    if (minCost) where.avgCostPerDay = { gte: parseFloat(minCost) };
    if (maxCost) where.avgCostPerDay = { ...where.avgCostPerDay, lte: parseFloat(maxCost) };
    if (season) where.bestSeason = { has: season };
    if (tags) where.tags = { hasSome: Array.isArray(tags) ? tags : [tags] };

    const { skip, take } = getSkipLimit(Number(page), Number(limit));
    const [destinations, total] = await Promise.all([
      prisma.destination.findMany({ where, skip, take }),
      prisma.destination.count({ where }),
    ]);

    const result = {
      destinations,
      ...getPaginationData(total, Number(page), Number(limit)),
    };

    await setCachedData(cacheKey, result, 3600);
    return result;
  }

  static async getById(id: string) {
    const cacheKey = `destinations:${id}`;
    const cached = await getCachedData(cacheKey);
    if (cached) return cached;

    const destination = await prisma.destination.findUnique({ where: { id } });
    if (destination) {
      await setCachedData(cacheKey, destination, 1800);
    }
    return destination;
  }

  static async getTrending() {
    const cacheKey = 'destinations:trending';
    const cached = await getCachedData(cacheKey);
    if (cached) return cached;

    // Trending = Top 10 by booking count in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const trending = await prisma.destination.findMany({
      where: {
        bookings: {
          some: { createdAt: { gte: thirtyDaysAgo } },
        },
      },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: {
        bookings: { _count: 'desc' },
      },
      take: 10,
    });

    await setCachedData(cacheKey, trending, 21600); // 6 hours
    return trending;
  }

  static async getRecommended(userTravelStyle: string[]) {
    // Simple matching by travel style tags
    return await prisma.destination.findMany({
      where: {
        tags: { hasSome: userTravelStyle },
      },
      take: 6,
    });
  }

  static async create(data: any) {
    const destination = await prisma.destination.create({ data });
    await invalidateCache('destinations:*');
    return destination;
  }

  static async update(id: string, data: any) {
    const destination = await prisma.destination.update({
      where: { id },
      data,
    });
    await invalidateCache('destinations:*');
    return destination;
  }
}
