"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const database_1 = require("../../config/database");
const response_utils_1 = require("../../shared/utils/response.utils");
const s3_utils_1 = require("../../shared/utils/s3.utils");
class UsersService {
    static async getProfile(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: { trips: true },
                },
            },
        });
        if (!user)
            throw new response_utils_1.AppError('User not found', 404);
        return user;
    }
    static async updateProfile(userId, data) {
        return await database_1.prisma.user.update({
            where: { id: userId },
            data,
        });
    }
    static async updateAvatar(userId, fileName, fileType) {
        const { uploadUrl, s3Key } = await (0, s3_utils_1.generateUploadUrl)(userId, fileName, fileType, 'AVATAR');
        // We update the DB after the frontend confirms the upload, 
        // or we can pre-emptively set the expected URL.
        // Following the user request: "Update avatarUrl in DB"
        const avatarUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
        await database_1.prisma.user.update({
            where: { id: userId },
            data: { avatar: avatarUrl },
        });
        return { uploadUrl, avatarUrl };
    }
    static async deleteAccount(userId) {
        // Soft delete logic would go here if needed, but the prompt says 
        // "Delete user - Revoke all tokens"
        await database_1.prisma.refreshToken.deleteMany({ where: { userId } });
        await database_1.prisma.user.delete({ where: { id: userId } });
    }
    static async getStats(userId) {
        const tripsCount = await database_1.prisma.trip.count({ where: { userId } });
        const bookings = await database_1.prisma.booking.findMany({
            where: { userId, status: 'CONFIRMED' },
            include: { destination: true },
        });
        const countriesVisited = new Set(bookings.map((b) => b.destination.country)).size;
        const totalSpent = bookings.reduce((sum, b) => sum + b.amount, 0);
        return {
            tripsCount,
            countriesVisited,
            totalSpent,
            totalDistance: 0, // Placeholder for external API logic
        };
    }
}
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map