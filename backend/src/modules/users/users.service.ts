import { prisma } from '../../config/database';
import { AppError } from '../../shared/utils/response.utils';
import { generateUploadUrl } from '../../shared/utils/s3.utils';

export class UsersService {
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { trips: true },
        },
      },
    });
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  static async updateProfile(userId: string, data: any) {
    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  static async updateAvatar(userId: string, fileName: string, fileType: string) {
    const { uploadUrl, s3Key } = await generateUploadUrl(userId, fileName, fileType, 'AVATAR');
    
    // We update the DB after the frontend confirms the upload, 
    // or we can pre-emptively set the expected URL.
    // Following the user request: "Update avatarUrl in DB"
    const avatarUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });

    return { uploadUrl, avatarUrl };
  }

  static async deleteAccount(userId: string) {
    // Soft delete logic would go here if needed, but the prompt says 
    // "Delete user - Revoke all tokens"
    await prisma.refreshToken.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  }

  static async getStats(userId: string) {
    const tripsCount = await prisma.trip.count({ where: { userId } });
    const bookings = await prisma.booking.findMany({
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
