"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DestinationsService = void 0;
const database_1 = require("../../config/database");
const cache_utils_1 = require("../../shared/utils/cache.utils");
const pagination_utils_1 = require("../../shared/utils/pagination.utils");
class DestinationsService {
    static async getAll(query) {
        const { page = 1, limit = 10, search, country, continent, minCost, maxCost, season, tags } = query;
        const cacheKey = `destinations:all:${JSON.stringify(query)}`;
        const cached = await (0, cache_utils_1.getCachedData)(cacheKey);
        if (cached)
            return cached;
        const where = { isActive: true };
        if (search)
            where.name = { contains: search, mode: 'insensitive' };
        if (country)
            where.country = country;
        if (continent)
            where.continent = continent;
        if (minCost)
            where.avgCostPerDay = { gte: parseFloat(minCost) };
        if (maxCost)
            where.avgCostPerDay = { ...where.avgCostPerDay, lte: parseFloat(maxCost) };
        if (season)
            where.bestSeason = { has: season };
        if (tags)
            where.tags = { hasSome: Array.isArray(tags) ? tags : [tags] };
        const { skip, take } = (0, pagination_utils_1.getSkipLimit)(Number(page), Number(limit));
        const [destinations, total] = await Promise.all([
            database_1.prisma.destination.findMany({ where, skip, take }),
            database_1.prisma.destination.count({ where }),
        ]);
        const result = {
            destinations,
            ...(0, pagination_utils_1.getPaginationData)(total, Number(page), Number(limit)),
        };
        await (0, cache_utils_1.setCachedData)(cacheKey, result, 3600);
        return result;
    }
    static async getById(id) {
        const cacheKey = `destinations:${id}`;
        const cached = await (0, cache_utils_1.getCachedData)(cacheKey);
        if (cached)
            return cached;
        const destination = await database_1.prisma.destination.findUnique({ where: { id } });
        if (destination) {
            await (0, cache_utils_1.setCachedData)(cacheKey, destination, 1800);
        }
        return destination;
    }
    static async getTrending() {
        const cacheKey = 'destinations:trending';
        const cached = await (0, cache_utils_1.getCachedData)(cacheKey);
        if (cached)
            return cached;
        // Trending = Top 10 by booking count in last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const trending = await database_1.prisma.destination.findMany({
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
        await (0, cache_utils_1.setCachedData)(cacheKey, trending, 21600); // 6 hours
        return trending;
    }
    static async getRecommended(userTravelStyle) {
        // Simple matching by travel style tags
        return await database_1.prisma.destination.findMany({
            where: {
                tags: { hasSome: userTravelStyle },
            },
            take: 6,
        });
    }
    static async create(data) {
        const destination = await database_1.prisma.destination.create({ data });
        await (0, cache_utils_1.invalidateCache)('destinations:*');
        return destination;
    }
    static async update(id, data) {
        const destination = await database_1.prisma.destination.update({
            where: { id },
            data,
        });
        await (0, cache_utils_1.invalidateCache)('destinations:*');
        return destination;
    }
}
exports.DestinationsService = DestinationsService;
//# sourceMappingURL=destinations.service.js.map