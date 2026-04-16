"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../../config/database");
const redis_1 = require("../../config/redis");
const response_utils_1 = require("../../shared/utils/response.utils");
const jwt_utils_1 = require("../../shared/utils/jwt.utils");
const email_utils_1 = require("../../shared/utils/email.utils");
class AuthService {
    static async register(data) {
        const existingUser = await database_1.prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser)
            throw new response_utils_1.AppError('User already exists', 400);
        const passwordHash = await bcryptjs_1.default.hash(data.password, 12);
        const user = await database_1.prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                name: data.name,
                travelStyle: data.travelStyle || [],
            },
        });
        const { subject, html } = (0, email_utils_1.welcomeEmail)(user.name, user.email);
        await (0, email_utils_1.sendEmail)(user.email, subject, html);
        return this.generateTokens(user);
    }
    static async login(data) {
        const user = await database_1.prisma.user.findUnique({ where: { email: data.email } });
        if (!user || !user.passwordHash || !(await bcryptjs_1.default.compare(data.password, user.passwordHash))) {
            throw new response_utils_1.AppError('Invalid email or password', 401);
        }
        return this.generateTokens(user);
    }
    static async refreshToken(token) {
        const storedToken = await database_1.prisma.refreshToken.findUnique({ where: { token } });
        if (!storedToken || storedToken.expiresAt < new Date()) {
            throw new response_utils_1.AppError('Invalid or expired refresh token', 401);
        }
        const { id } = (0, jwt_utils_1.verifyRefreshToken)(token);
        const user = await database_1.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new response_utils_1.AppError('User not found', 404);
        // Rotate refresh token
        await database_1.prisma.refreshToken.delete({ where: { id: storedToken.id } });
        return this.generateTokens(user);
    }
    static async logout(token) {
        await database_1.prisma.refreshToken.delete({ where: { token } }).catch(() => { });
    }
    static async forgotPassword(email) {
        const user = await database_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new response_utils_1.AppError('User not found', 404);
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const hashedToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
        await redis_1.redis.set(`reset:${hashedToken}`, user.id, 'EX', 600); // 10 min TTL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const { subject, html } = (0, email_utils_1.passwordResetEmail)(resetUrl, user);
        await (0, email_utils_1.sendEmail)(user.email, subject, html);
    }
    static async resetPassword(token, newPassword) {
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const userId = await redis_1.redis.get(`reset:${hashedToken}`);
        if (!userId)
            throw new response_utils_1.AppError('Invalid or expired reset token', 400);
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
        await database_1.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
        await database_1.prisma.refreshToken.deleteMany({ where: { userId } });
        await redis_1.redis.del(`reset:${hashedToken}`);
    }
    static async generateTokens(user) {
        const accessToken = (0, jwt_utils_1.signAccessToken)(user.id, user.role);
        const refreshToken = (0, jwt_utils_1.signRefreshToken)(user.id);
        await database_1.prisma.refreshToken.create({
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
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map