import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { AppError } from '../../shared/utils/response.utils';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../shared/utils/jwt.utils';
import { sendEmail, welcomeEmail, passwordResetEmail } from '../../shared/utils/email.utils';

export class AuthService {
  static async register(data: any) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new AppError('User already exists', 400);

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        travelStyle: data.travelStyle || [],
      },
    });

    const { subject, html } = welcomeEmail(user.name, user.email);
    await sendEmail(user.email, subject, html);

    return this.generateTokens(user);
  }

  static async login(data: any) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !user.passwordHash || !(await bcrypt.compare(data.password, user.passwordHash))) {
      throw new AppError('Invalid email or password', 401);
    }

    return this.generateTokens(user);
  }

  static async refreshToken(token: string) {
    const storedToken = await prisma.refreshToken.findUnique({ where: { token } });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const { id } = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('User not found', 404);

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    return this.generateTokens(user);
  }

  static async logout(token: string) {
    await prisma.refreshToken.delete({ where: { token } }).catch(() => {});
  }

  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('User not found', 404);

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await redis.set(`reset:${hashedToken}`, user.id, 'EX', 600); // 10 min TTL

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const { subject, html } = passwordResetEmail(resetUrl, user);
    await sendEmail(user.email, subject, html);
  }

  static async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const userId = await redis.get(`reset:${hashedToken}`);

    if (!userId) throw new AppError('Invalid or expired reset token', 400);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await prisma.refreshToken.deleteMany({ where: { userId } });
    await redis.del(`reset:${hashedToken}`);
  }

  private static async generateTokens(user: any) {
    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }
}
